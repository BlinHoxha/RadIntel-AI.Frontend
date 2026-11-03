import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e-api',
  outputDir: './test-results/api',
  workers: 1,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5182', trace: 'off', screenshot: 'off' },
  webServer: {
    command: 'npm run dev -- --port 5182 --strictPort',
    url: 'http://127.0.0.1:5182',
    reuseExistingServer: false,
    env: {
      VITE_DEMO_MODE: 'false',
      VITE_ENABLE_DEVELOPMENT_AUTH: 'true',
      RADINTEL_API_TARGET: process.env.RADINTEL_TEST_API_URL || 'http://127.0.0.1:5305',
    },
  },
  projects: [{ name: 'api-chromium', use: { browserName: 'chromium' } }],
});
