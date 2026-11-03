import { defineConfig } from '@playwright/test';
const port = Number(process.env.RADINTEL_DEMO_TEST_PORT || 5173);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('Invalid demo test port.');
const origin = 'http://127.0.0.1:' + port;
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results/demo',
  fullyParallel: false,
  use: { baseURL: origin, trace: 'off', screenshot: 'off' },
  webServer: {
    command: 'npm run dev -- --port ' + port + ' --strictPort',
    url: origin,
    reuseExistingServer: !process.env.CI && !process.env.RADINTEL_DEMO_TEST_PORT,
    env: {
      VITE_DEMO_MODE: 'true',
      VITE_ENABLE_VIEWER_PROOF: 'false',
      VITE_ENABLE_DEVELOPMENT_AUTH: 'false',
    },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
