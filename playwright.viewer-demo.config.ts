import { defineConfig } from '@playwright/test';
// Demo-mode viewer proof: MSW-backed synthetic API plus the pinned local OHIF host. Requires
// `npm run viewer:prepare` first. Not part of hosted CI (the OHIF artifact is not prepared there).
// RADINTEL_VIEWER_CHANNELS=chrome,msedge runs it on installed Chrome and Edge.
const app = 'http://127.0.0.1:5194';
const viewerPort = 5186;
const channels = (process.env.RADINTEL_VIEWER_CHANNELS || '')
  .split(',')
  .map((name) => name.trim())
  .filter((name) => ['chrome', 'msedge'].includes(name));
export default defineConfig({
  testDir: './e2e-viewer-demo',
  outputDir: './test-results/viewer-demo',
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: app,
    // Tall enough that the viewer below the panel controls is on screen for mouse input.
    viewport: { width: 1800, height: 2600 },
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node scripts/serve-viewer.mjs',
      port: viewerPort,
      reuseExistingServer: false,
      env: { RADINTEL_VIEWER_PARENT_ORIGIN: app, RADINTEL_VIEWER_PORT: String(viewerPort) },
    },
    {
      command: 'npm run dev -- --port 5194 --strictPort',
      url: app,
      reuseExistingServer: false,
      env: {
        VITE_DEMO_MODE: 'true',
        VITE_ENABLE_DEVELOPMENT_AUTH: 'false',
        VITE_ENABLE_VIEWER_PROOF: 'true',
        VITE_VIEWER_ORIGIN: 'http://127.0.0.1:' + viewerPort,
      },
    },
  ],
  projects: channels.length
    ? channels.map((channel) => ({
        name: 'viewer-demo-' + channel,
        use: { browserName: 'chromium' as const, channel },
      }))
    : [{ name: 'viewer-demo-chromium', use: { browserName: 'chromium' } }],
});
