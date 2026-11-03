export interface DevelopmentIdentity {
  userId: string;
  organizationId: string;
  simulateMfa: boolean;
}
export type ClientConfiguration =
  import('../api/generated').components['schemas']['ClientConfigurationResponse'];
export const isLoopbackHost = (hostname: string) =>
  ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname.toLowerCase());

export function developmentBridgeEnabled() {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEVELOPMENT_AUTH === 'true' &&
    isLoopbackHost(window.location.hostname)
  );
}

export function validateDevelopmentIdentity(value: DevelopmentIdentity) {
  if (
    !value.userId.trim() ||
    value.userId.length > 200 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.organizationId) ||
    /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value.organizationId)
  )
    throw new Error('Enter a user ID and a nonempty organization UUID.');
}
