import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/setup';
import {
  configureDevelopmentAuthentication,
  clearCredentials,
  request,
  setCredentials,
} from '../api/client';
import { isLoopbackHost, validateDevelopmentIdentity } from './development';

const identity = {
  userId: 'local-radiologist',
  organizationId: '11111111-1111-4111-8111-111111111111',
  simulateMfa: true,
};
afterEach(() => {
  clearCredentials();
  configureDevelopmentAuthentication({
    developmentAuthentication: false,
    simulatedMfaAllowed: false,
  });
  vi.unstubAllEnvs();
});
describe('development authentication boundary', () => {
  it('only recognizes explicit loopback hostnames', () => {
    expect(isLoopbackHost('127.0.0.1')).toBe(true);
    expect(isLoopbackHost('localhost.evil.example')).toBe(false);
    expect(isLoopbackHost('192.168.1.1')).toBe(false);
  });
  it('validates a nonempty organization and bounded user ID', () => {
    expect(() => validateDevelopmentIdentity(identity)).not.toThrow();
    expect(() =>
      validateDevelopmentIdentity({
        ...identity,
        organizationId: '00000000-0000-0000-0000-000000000000',
      }),
    ).toThrow();
    expect(() => validateDevelopmentIdentity({ ...identity, userId: ' ' })).toThrow();
  });
  it('requires both an explicit frontend opt-in and backend Development mode', () => {
    configureDevelopmentAuthentication({
      developmentAuthentication: true,
      simulatedMfaAllowed: true,
    });
    expect(() => setCredentials('local-token', () => {}, identity)).toThrow();
    vi.stubEnv('VITE_ENABLE_DEVELOPMENT_AUTH', 'true');
    configureDevelopmentAuthentication({
      developmentAuthentication: false,
      simulatedMfaAllowed: false,
    });
    expect(() => setCredentials('local-token', () => {}, identity)).toThrow();
  });
  it('rejects development identity in a production build and simulated MFA without backend permission', () => {
    vi.stubEnv('VITE_ENABLE_DEVELOPMENT_AUTH', 'true');
    configureDevelopmentAuthentication({
      developmentAuthentication: true,
      simulatedMfaAllowed: false,
    });
    expect(() => setCredentials('local-token', () => {}, identity)).toThrow('simulated MFA');
    vi.stubEnv('DEV', false);
    expect(() =>
      setCredentials('local-token', () => {}, { ...identity, simulateMfa: false }),
    ).toThrow('unavailable');
  });
  it('sends development headers only for the explicitly selected development session', async () => {
    vi.stubEnv('VITE_ENABLE_DEVELOPMENT_AUTH', 'true');
    configureDevelopmentAuthentication({
      developmentAuthentication: true,
      simulatedMfaAllowed: true,
    });
    server.use(
      http.get('/api/v1/session', ({ request }) =>
        HttpResponse.json({
          user: request.headers.get('X-RadIntel-User'),
          tenant: request.headers.get('X-RadIntel-Tenant'),
          mfa: request.headers.get('X-RadIntel-Mfa'),
        }),
      ),
    );
    setCredentials('local-token', () => {}, identity);
    expect(await request('session')).toEqual({
      user: identity.userId,
      tenant: identity.organizationId,
      mfa: 'true',
    });
    setCredentials('jwt-token', () => {});
    expect(await request('session')).toEqual({ user: null, tenant: null, mfa: null });
  });
});
