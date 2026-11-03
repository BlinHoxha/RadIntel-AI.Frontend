export const viewerProofEnabled =
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_VIEWER_PROOF === 'true' &&
  ['127.0.0.1', 'localhost'].includes(window.location.hostname);
export function proofOrigin() {
  const value = import.meta.env.VITE_VIEWER_ORIGIN || 'http://127.0.0.1:5184';
  const url = new URL(value);
  if (
    url.origin !== value ||
    url.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost'].includes(url.hostname)
  )
    throw new Error('Viewer proof requires an exact loopback HTTP origin.');
  return url.origin;
}
