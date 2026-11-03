import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = 'http://127.0.0.1:5181';
const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5181', '--strictPort'],
  {
    windowsHide: true,
    stdio: 'ignore',
    env: { ...process.env, VITE_DEMO_MODE: 'true' },
  },
);
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for Vite. */
    }
    if (server.exitCode !== null) throw new Error('Preview server exited before startup.');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('Preview server did not start.');
  await mkdir('artifacts', { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 1,
  });
  const capture = async (path) => {
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({ path, fullPage: true });
  };
  await page.goto(origin);
  await page.getByRole('button', { name: 'Explore demo workspace' }).click();
  await page.getByRole('button', { name: 'Open study: Brain Demo Sam Taylor' }).waitFor();
  await capture('artifacts/dashboard.png');
  await page.getByRole('button', { name: 'Open study: Brain Demo Sam Taylor' }).click();
  await page.getByLabel('Findings', { exact: true }).waitFor();
  await page.getByText('No studies linked.', { exact: true }).waitFor();
  await capture('artifacts/report-editor.png');
  await page.getByRole('button', { name: 'Draft assistance', exact: true }).click();
  await page
    .getByLabel('Original observations')
    .fill('Synthetic source observations for workflow demonstration.');
  await page
    .getByLabel('Clinician-checked observations')
    .fill('Synthetic checked observations. No clinical conclusions supplied.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save checked input' }).click();
  await page.getByText('Checked input saved. Prior proposals are stale.').waitFor();
  await page.getByLabel('Published source template').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Request draft proposal' }).click();
  await page.getByText('Unverified AI proposal', { exact: true }).waitFor();
  await capture('artifacts/ai-review.png');
  await page.getByRole('link', { name: 'Patients', exact: true }).click();
  await page.getByRole('heading', { name: 'Demo Alex Morgan' }).waitFor();
  await capture('artifacts/patient-registry.png');
  console.log('Captured dashboard, report editor, AI review and patient registry in artifacts/.');
} finally {
  await browser?.close();
  server.kill();
}
