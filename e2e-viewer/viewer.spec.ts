import {
  test,
  expect,
  request as apiRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { fixture } from '../viewer/synthetic.mjs';
const origin = process.env.RADINTEL_TEST_API_URL;
const token = process.env.RADINTEL_TEST_API_TOKEN;
const tenant = process.env.RADINTEL_VIEWER_TENANT;
const facility = process.env.RADINTEL_VIEWER_FACILITY;
if (
  !origin ||
  !token ||
  !tenant ||
  !facility ||
  !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)
)
  throw new Error('Run npm run test:integration:viewer with owned synthetic resources.');
let api: APIRequestContext;
async function post(path: string, data: unknown) {
  const response = await api.post(path, { data });
  expect(response.ok(), 'Synthetic API returned ' + response.status()).toBeTruthy();
  return response.json();
}
test.beforeAll(async () => {
  api = await apiRequest.newContext({
    baseURL: origin,
    extraHTTPHeaders: {
      Authorization: 'Bearer ' + token,
      'X-RadIntel-Tenant': tenant,
      'X-RadIntel-User': 'viewer-proof-owner',
      'X-RadIntel-Mfa': 'true',
    },
  });
  const root = '/api/v1/facilities/' + facility;
  for (const kind of ['CT', 'DX']) {
    const source = fixture(kind);
    const existingPatients = await (await api.get(root + '/patients?pageSize=100')).json();
    const existing = existingPatients.items.find(
      (item: { identifier: string }) => item.identifier === source.patientIdentifier,
    );
    if (existing) {
      const worklist = await (await api.get(root + '/worklist?pageSize=100')).json();
      expect(
        worklist.items.some(
          (item: { patientId: string; modality: string; status: string }) =>
            item.patientId === existing.id &&
            item.modality === kind &&
            item.status === 'ReportDraft',
        ),
      ).toBe(true);
      continue;
    }
    const patient = await post(root + '/patients', {
      identifier: source.patientIdentifier,
      identifierIssuer: source.issuer,
      displayName: 'Synthetic Viewer ' + kind,
      birthDate: null,
    });
    let order = await post(root + '/imaging-orders', {
      patientId: patient.id,
      modality: kind,
      bodyRegion: 'Chest',
      referral: 'Synthetic viewer proof only',
      priority: 'Routine',
    });
    for (const status of ['CheckedIn', 'Acquired'])
      order = await post(root + '/imaging-orders/' + order.id + '/transition', {
        expectedToken: order.concurrencyToken,
        status,
        reason: 'Synthetic',
      });
    await post(root + '/imaging-orders/' + order.id + '/studies', {
      expectedToken: order.concurrencyToken,
      archiveKey: 'proof',
      studyInstanceUid: source.studyInstanceUid,
    });
    const context = await (await api.get(root + '/imaging-orders/' + order.id + '/context')).json();
    order = await post(root + '/imaging-orders/' + order.id + '/claim', {
      expectedToken: context.order.concurrencyToken,
    });
    let report = await post(root + '/imaging-orders/' + order.id + '/reports', {
      expectedToken: order.concurrencyToken,
    });
    report = await post(root + '/reports/' + report.id + '/drafts', {
      expectedToken: report.concurrencyToken,
      examination: 'Synthetic ' + kind,
      findings: 'Synthetic verified observations.',
      impression: 'Synthetic report only.',
      language: 'en',
      contentSchemaVersion: 2,
    });
  }
});
test.afterAll(async () => {
  await api?.dispose();
});
async function connect(page: Page, kind: string) {
  await page.goto('/');
  await page.getByLabel('Access token', { exact: true }).fill(token!);
  await page.getByLabel('Development user ID').fill('viewer-proof-owner');
  await page.getByLabel('Organization UUID').fill(tenant!);
  await page.getByRole('button', { name: 'Connect to institution' }).click();
  await page.getByRole('button', { name: 'Open study: Chest Synthetic Viewer ' + kind }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Synthetic verified observations.',
  );
  await page.locator('.study-link').first().click();
}
for (const kind of ['CT', 'DX'])
  test(
    'real API ' +
      kind +
      ' pixels render in pinned OHIF; close preserves unsaved report and disposes frame',
    async ({ page }) => {
      const baselineWorkers = page.workers().length;
      const requested: string[] = [];
      const credentialLeaks: string[] = [];
      page.on('request', (request) => {
        requested.push(request.url());
        if (request.url().startsWith(process.env.VITE_VIEWER_ORIGIN!)) {
          const headers = request.headers();
          if (headers.authorization || headers['x-radintel-tenant'] || headers['x-radintel-user'])
            credentialLeaks.push(request.url());
        }
      });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await connect(page, kind);
      await page
        .getByLabel('Findings', { exact: true })
        .fill('Unsaved synthetic observations retained.');
      await page.getByRole('button', { name: 'Open synthetic viewer proof' }).click();
      const iframe = page.locator('iframe[title="Synthetic OHIF viewer"]');
      const child = page.frameLocator('iframe[title="Synthetic OHIF viewer"]');
      const confirm = child.getByRole('button', { name: 'Confirm and hide' });
      if (await confirm.isVisible({ timeout: 10000 }).catch(() => false)) await confirm.click();
      await expect(iframe).toHaveAttribute('data-rendered', 'true', { timeout: 60000 });
      const firstFrameMs = Number(await iframe.getAttribute('data-first-frame-ms'));
      expect(firstFrameMs).toBeLessThan(60000);
      await expect(child.locator('canvas').first()).toBeVisible();
      await iframe.screenshot({ path: 'artifacts/viewer-' + kind.toLowerCase() + '.png' });
      expect(
        await child
          .locator('body')
          .evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
      ).toEqual({ local: 0, session: 0 });
      await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
        'Unsaved synthetic observations retained.',
      );
      const allowed = new Set([
        new URL(page.url()).origin,
        new URL(process.env.VITE_VIEWER_ORIGIN!).origin,
      ]);
      expect(
        requested.filter((url) => /^https?:/.test(url) && !allowed.has(new URL(url).origin)),
      ).toEqual([]);
      expect(page.url()).not.toContain(fixture(kind).studyInstanceUid);
      expect(errors).toEqual([]);
      expect(credentialLeaks).toEqual([]);
      expect(
        await child.locator('body').evaluate(async () => ({
          registrations: (await navigator.serviceWorker.getRegistrations()).length,
          caches: (await caches.keys()).length,
        })),
      ).toEqual({ registrations: 0, caches: 0 });
      const oldFrame = await (await iframe.elementHandle())!.contentFrame();
      await page.getByRole('button', { name: 'Close viewer proof' }).click();
      await expect(iframe).toHaveCount(0);
      await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
        'Unsaved synthetic observations retained.',
      );
      await expect.poll(() => oldFrame?.isDetached()).toBe(true);
      await expect.poll(() => page.workers().length).toBeLessThanOrEqual(baselineWorkers);
      console.log(kind + ' synthetic first-frame time: ' + firstFrameMs + ' ms');
    },
  );

test('logout aborts delayed viewer pixels and removes the child context', async ({ page }) => {
  await connect(page, 'CT');
  let arrived!: () => void;
  const requested = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/viewer-frames', async (route) => {
    arrived();
    await gate;
    await route.abort().catch(() => {});
  });
  await page.getByRole('button', { name: 'Open synthetic viewer proof' }).click();
  await requested;
  const frame = await (await page.locator('iframe').elementHandle())!.contentFrame();
  await page.getByRole('button', { name: 'Sign out' }).click();
  release();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Welcome to your workspace' })).toBeVisible();
  await expect.poll(() => frame?.isDetached()).toBe(true);
  await expect.poll(() => page.workers().length).toBe(0);
});
