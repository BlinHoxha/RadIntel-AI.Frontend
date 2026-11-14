import { defineConfig } from '@playwright/test';
// Hosted CI uses bundled Chromium. Owner-supported browsers run locally on request, for example
// RADINTEL_VIEWER_CHANNELS=chrome,msedge npm run test:integration:viewer.
const channels = (process.env.RADINTEL_VIEWER_CHANNELS || '')
  .split(',')
  .map((name) => name.trim())
  .filter((name) => ['chrome', 'msedge'].includes(name));
export default defineConfig({
  testDir: './e2e-viewer',
  outputDir: './test-results/viewer',
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: 'http://127.0.0.1:5192',
    // Tall enough that the viewer below the panel controls is on screen for mouse input.
    viewport: { width: 1800, height: 2600 },
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5192 --strictPort',
    url: 'http://127.0.0.1:5192',
    reuseExistingServer: false,
    env: {
      VITE_DEMO_MODE: 'false',
      VITE_ENABLE_DEVELOPMENT_AUTH: 'true',
      VITE_ENABLE_VIEWER_PROOF: 'true',
      VITE_VIEWER_ORIGIN: process.env.VITE_VIEWER_ORIGIN || 'http://127.0.0.1:5184',
      RADINTEL_API_TARGET: process.env.RADINTEL_TEST_API_URL || 'http://127.0.0.1:5305',
    },
  },
  projects: channels.length
    ? channels.map((channel) => ({
        name: 'viewer-' + channel,
        use: { browserName: 'chromium' as const, channel },
      }))
    : [{ name: 'viewer-chromium', use: { browserName: 'chromium' } }],
});
