import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const target = env.RADINTEL_API_TARGET || 'http://localhost:5300';
  const upstream = new URL(target);
  const bridge = env.VITE_ENABLE_DEVELOPMENT_AUTH === 'true';
  if (bridge && !['localhost', '127.0.0.1', '[::1]'].includes(upstream.hostname))
    throw new Error('Development authentication proxy must target a loopback API.');
  const proxy = (): import('vite').ProxyOptions => ({
    target,
    changeOrigin: true,
    configure: (server) =>
      server.on('proxyReq', (outgoing) => {
        if (!bridge)
          for (const header of ['X-RadIntel-User', 'X-RadIntel-Tenant', 'X-RadIntel-Mfa'])
            outgoing.removeHeader(header);
      }),
  });
  return {
    plugins: [react()],
    server: {
      watch: { ignored: ['**/.tools/**'] },
      proxy: {
        '/api': proxy(),
        '/client-config': proxy(),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
    },
  };
});
