export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const errorMessage = (status: number) =>
  ({
    401: 'Your session expired. Connect again.',
    403: 'You do not have permission for this action.',
    404: 'This record is unavailable in your facility.',
    409: 'This record changed. Reload before retrying. Your unsaved text is preserved.',
    422: 'Check the entered values.',
    429: 'Too many requests. Wait before trying again.',
    503: 'This service is unavailable. Manual reporting remains available.',
  })[status] || 'The request could not be completed. Please try again.';

let token = '';
let generation = 0;
let expire: () => void = () => {};
let clientConfiguration: ClientConfiguration = {
  developmentAuthentication: false,
  simulatedMfaAllowed: false,
};
let developmentIdentity: DevelopmentIdentity | undefined;
const activeRequests = new Set<AbortController>();
const contextListeners = new Set<() => void>();
export function onContextInvalidated(listener: () => void) {
  contextListeners.add(listener);
  return () => {
    contextListeners.delete(listener);
  };
}
function invalidateRequests() {
  generation++;
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
  [...contextListeners].forEach((listener) => listener());
}
export function configureDevelopmentAuthentication(config: ClientConfiguration) {
  clientConfiguration = config;
}
export function setCredentials(
  value: string,
  onExpire: () => void,
  identity?: DevelopmentIdentity,
) {
  if (identity) {
    if (!developmentBridgeEnabled() || !clientConfiguration.developmentAuthentication)
      throw new Error('Development identity is unavailable in this environment.');
    validateDevelopmentIdentity(identity);
    if (identity.simulateMfa && !clientConfiguration.simulatedMfaAllowed)
      throw new Error('The backend has not enabled simulated MFA.');
  }
  token = value;
  developmentIdentity = identity ? { ...identity, userId: identity.userId.trim() } : undefined;
  expire = onExpire;
  invalidateRequests();
}
export function clearCredentials() {
  token = '';
  developmentIdentity = undefined;
  invalidateRequests();
}
export function changeContext() {
  invalidateRequests();
}
async function transport<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
  binary = false,
): Promise<T> {
  if (!token) throw new ApiError(401, errorMessage(401));
  const stamp = generation;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-Correlation-ID': crypto.randomUUID(),
  };
  if (developmentIdentity) {
    if (!developmentBridgeEnabled() || !clientConfiguration.developmentAuthentication)
      throw new ApiError(401, 'Development identity is no longer allowed. Connect again.');
    headers['X-RadIntel-User'] = developmentIdentity.userId;
    headers['X-RadIntel-Tenant'] = developmentIdentity.organizationId;
    if (developmentIdentity.simulateMfa && clientConfiguration.simulatedMfaAllowed)
      headers['X-RadIntel-Mfa'] = 'true';
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  activeRequests.add(controller);
  let response: Response;
  try {
    try {
      response = await fetch(`/api/v1/${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (error) {
      if (stamp !== generation)
        throw new ApiError(401, 'The workspace changed. Reload before continuing.');
      if (controller.signal.aborted) throw error;
      throw new ApiError(0, 'Could not reach the service. Check your connection.');
    }
    if (stamp !== generation)
      throw new ApiError(401, 'The workspace changed. Reload before continuing.');
    if (!response.ok) {
      if (response.status === 401) expire();
      // Do not render arbitrary server exception text or patient data in global errors.
      throw new ApiError(response.status, errorMessage(response.status));
    }
    let value: unknown;
    if (binary) {
      const maximum = 16 * 1024 * 1024;
      if (
        response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !==
          'application/octet-stream' ||
        Number(response.headers.get('Content-Length') || 0) > maximum ||
        !response.body
      ) {
        void response.body?.cancel().catch(() => {});
        throw new ApiError(503, 'The image response is unsupported or too large.');
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { value: chunk, done } = await reader.read();
          if (done) break;
          size += chunk.byteLength;
          if (size > maximum) throw new ApiError(503, 'The image response is too large.');
          chunks.push(chunk);
        }
      } catch (error) {
        void reader.cancel().catch(() => {});
        throw error;
      } finally {
        reader.releaseLock();
      }
      const output = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.length;
      }
      value = output.buffer;
    } else if (response.headers.get('Content-Type')?.startsWith('text/plain'))
      value = await response.blob();
    else value = response.status === 204 ? undefined : await response.json();
    if (stamp !== generation)
      throw new ApiError(401, 'The workspace changed. Reload before continuing.');
    if (controller.signal.aborted) throw new DOMException('The request was aborted.', 'AbortError');
    return value as T;
  } catch (error) {
    if (stamp !== generation)
      throw new ApiError(401, 'The workspace changed. Reload before continuing.');
    if (controller.signal.aborted) throw new DOMException('The request was aborted.', 'AbortError');
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'Could not read the service response.');
  } finally {
    activeRequests.delete(controller);
    signal?.removeEventListener('abort', abort);
  }
}
export function request<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  return transport<T>(path, method, body, signal);
}
// All binary requests use the same private credentials, invalidation and redacted errors as JSON.
export function requestBinary(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  return transport<ArrayBuffer>(path, 'POST', body, signal, true);
}
export function facilityPath(facility: string, path: string) {
  return `facilities/${encodeURIComponent(facility)}/${path}`;
}
import {
  developmentBridgeEnabled,
  validateDevelopmentIdentity,
  type ClientConfiguration,
  type DevelopmentIdentity,
} from '../auth/development';
