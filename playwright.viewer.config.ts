import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e-viewer',
  outputDir: './test-results/viewer',
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: 'http://127.0.0.1:5192',
    viewport: { width: 1800, height: 1200 },
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
  projects: [{ name: 'viewer-chromium', use: { browserName: 'chromium' } }],
});
