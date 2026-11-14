import {
  test,
  expect,
  request as apiRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { fixture } from '../viewer/synthetic.mjs';
import {
  dragFromCentre,
  dragImage,
  expectLength,
  expectOnlyApprovedChrome,
  settledViewState,
  viewState,
} from './tools';
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
  // With several browser channels, each project re-runs every case right after the previous one;
  // wait out the per-user clinical rate window (see the logout case) before starting again.
  if (process.env.RADINTEL_VIEWER_CHANNELS) {
    test.setTimeout(180000);
    await new Promise((resolve) => setTimeout(resolve, 61000));
  }
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
  for (const kind of ['CT', 'DX', 'GEO', 'MISMATCH', 'TSYNTAX']) {
    const source = fixture(kind);
    const modality = ['DX', 'TSYNTAX'].includes(kind) ? 'DX' : 'CT';
    const existingPatients = await (await api.get(root + '/patients?pageSize=100')).json();
    const existing = existingPatients.items.find(
      (item: { identifier: string }) => item.identifier === source.patientIdentifier,
    );
    if (existing) {
      const listed = await api.get(root + '/worklist?pageSize=100');
      expect(listed.ok(), 'Worklist returned ' + listed.status()).toBeTruthy();
      const worklist = await listed.json();
      expect(
        worklist.items.some(
          (item: { patientId: string; modality: string; status: string }) =>
            item.patientId === existing.id &&
            item.modality === modality &&
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
      modality,
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
  // First load after a worker restart can be slow; the assertion itself is unchanged.
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Synthetic verified observations.',
    { timeout: 15000 },
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
      await iframe.screenshot({ path: 'artifacts/run/viewer-' + kind.toLowerCase() + '.png' });
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

async function openViewer(page: Page) {
  await page.getByRole('button', { name: 'Open synthetic viewer proof' }).click();
  const child = page.frameLocator('iframe[title="Synthetic OHIF viewer"]');
  const confirm = child.getByRole('button', { name: 'Confirm and hide' });
  if (await confirm.isVisible({ timeout: 10000 }).catch(() => false)) await confirm.click();
}
function recordFrames(page: Page) {
  const frames: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/viewer-frames'))
      frames.push((request.postDataJSON() as { sopInstanceUid: string }).sopInstanceUid);
  });
  return frames;
}

test('real API geometry study: verified slice order, identity labels, warnings and series navigation', async ({
  page,
}) => {
  const uid = (suffix: string) => fixture('GEO').studyInstanceUid + '.' + suffix;
  const frames = recordFrames(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await connect(page, 'GEO');
  const findings = page.getByLabel('Findings', { exact: true });
  await findings.fill('Unsaved geometry observations retained.');
  await openViewer(page);
  await expect(page.locator('iframe[title="Synthetic OHIF viewer"]')).toHaveAttribute(
    'data-rendered',
    'true',
    { timeout: 60000 },
  );
  const warnings = page.getByRole('list', { name: 'Viewer warnings' });
  await expect(warnings).toContainText('Multiframe image unsupported (1 image not shown)');
  await expect(warnings).toContainText('Unsupported image format (1 image not shown)');
  await expect(warnings).toContainText('Series 3: Measurement unavailable: pixel spacing missing');
  const image = page.getByTestId('viewer-image');
  const slice = page.getByTestId('viewer-slice');
  const position = page.getByTestId('viewer-position');
  // Source order is z 4, 0, 2; the viewer must start at z 0 and step by geometry.
  await expect(page.getByTestId('viewer-series')).toHaveText(uid('1'));
  await expect(image).toHaveText(uid('1.2'));
  await expect(slice).toHaveText('1 of 3');
  await expect(position).toHaveText('(0.0, 0.0, 0.0) mm');
  await expect(page.getByTestId('viewer-orientation')).toHaveText(
    'Left R, right L, top A, bottom P',
  );
  await expect(page.getByTestId('viewer-spacing')).toHaveText(
    '0.75 mm between rows × 0.75 mm between columns',
  );
  const previous = page.getByRole('button', { name: 'Previous slice' });
  const next = page.getByRole('button', { name: 'Next slice' });
  await expect(previous).toBeDisabled();
  await next.click();
  await expect(image).toHaveText(uid('1.3'));
  await expect(slice).toHaveText('2 of 3');
  await expect(position).toHaveText('(0.0, 0.0, 2.0) mm');
  await next.click();
  await expect(image).toHaveText(uid('1.1'));
  await expect(slice).toHaveText('3 of 3');
  await expect(position).toHaveText('(0.0, 0.0, 4.0) mm');
  await expect(next).toBeDisabled();
  // Keyboard only: focus the control and activate it without a pointer.
  await previous.focus();
  await page.keyboard.press('Enter');
  await expect(image).toHaveText(uid('1.3'));
  const series = page.getByLabel('Series');
  await series.focus();
  await series.selectOption('2');
  await expect(page.getByTestId('viewer-series')).toHaveText(uid('2'));
  await expect(image).toHaveText(uid('2.2'));
  await expect(slice).toHaveText('1 of 2');
  await expect(page.getByTestId('viewer-orientation')).toHaveText(
    'Left R, right L, top H, bottom F',
  );
  await expect(page.getByTestId('viewer-spacing')).toHaveText(
    '0.5 mm between rows × 1 mm between columns',
  );
  await next.click();
  await expect(image).toHaveText(uid('2.1'));
  await expect(position).toHaveText('(0.0, 3.0, 0.0) mm');
  await series.selectOption('3');
  await expect(image).toHaveText(uid('3.1'));
  await expect(page.getByTestId('viewer-spacing')).toHaveText(
    'Measurement unavailable: pixel spacing missing',
  );
  await expect(findings).toHaveValue('Unsaved geometry observations retained.');
  const allowed = new Set(['1.1', '1.2', '1.3', '2.1', '2.2', '3.1'].map(uid));
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.filter((sop) => !allowed.has(sop))).toEqual([]);
  expect(frames).not.toContain(uid('4.1'));
  expect(frames).not.toContain(uid('5.1'));
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Close viewer proof' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(findings).toHaveValue('Unsaved geometry observations retained.');
});

test('real API identity mismatch: viewer unavailable, no pixels requested, report retained', async ({
  page,
}) => {
  const frames = recordFrames(page);
  await connect(page, 'MISMATCH');
  const findings = page.getByLabel('Findings', { exact: true });
  await findings.fill('Unsaved mismatch observations retained.');
  await page.getByRole('button', { name: 'Open synthetic viewer proof' }).click();
  await expect(
    page.getByRole('region', { name: 'Synthetic OHIF viewer proof' }).getByRole('alert'),
  ).toHaveText(
    'Viewer unavailable: the image identity or format could not be verified. Manual reporting remains available.',
    { timeout: 30000 },
  );
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByTestId('viewer-image')).toHaveCount(0);
  expect(frames).toEqual([]);
  await expect(findings).toHaveValue('Unsaved mismatch observations retained.');
});

test('logout aborts delayed viewer pixels and removes the child context', async ({ page }) => {
  // The API allows 120 clinical requests per user per minute (fixed window). Earlier cases in
  // this file use most of one window; staying idle for longer than a window guarantees a reset
  // with no requests counted against it, so this case starts with its full budget.
  test.setTimeout(180000);
  await page.waitForTimeout(61000);
  const failures: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400)
      failures.push(response.status() + ' ' + new URL(response.url()).pathname);
  });
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
  // Fail fast with the API status if the viewer gives up before requesting pixels.
  const outcome = await Promise.race([
    requested.then(() => 'pixels'),
    page
      .getByRole('region', { name: 'Synthetic OHIF viewer proof' })
      .getByRole('alert')
      .waitFor({ timeout: 70000 })
      .then(
        () => 'failed',
        () => new Promise<string>(() => {}),
      ),
  ]);
  expect(outcome, 'Viewer failed before pixels; API failures: ' + failures.join(', ')).toBe(
    'pixels',
  );
  const frame = await (await page.locator('iframe').elementHandle())!.contentFrame();
  await page.getByRole('button', { name: 'Sign out' }).click();
  release();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Welcome to your workspace' })).toBeVisible();
  await expect.poll(() => frame?.isDetached()).toBe(true);
  await expect.poll(() => page.workers().length).toBe(0);
});

// Runs after the logout case, inside the fresh rate window that case waits for.
test('real API unsupported transfer syntax: format message, no image, report retained', async ({
  page,
}) => {
  const frames = recordFrames(page);
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  await connect(page, 'TSYNTAX');
  const findings = page.getByLabel('Findings', { exact: true });
  await findings.fill('Unsaved format observations retained.');
  await openViewer(page);
  await expect(
    page.getByRole('region', { name: 'Synthetic OHIF viewer proof' }).getByRole('alert'),
  ).toHaveText(
    'Image could not be shown: unsupported image format or image service unavailable. Manual reporting remains available.',
    { timeout: 60000 },
  );
  await expect(page.locator('iframe')).toHaveCount(0);
  // Only the listed instance was requested (main view and thumbnail may both ask) and rejected.
  expect(frames.length).toBeGreaterThan(0);
  expect(new Set(frames)).toEqual(new Set([fixture('TSYNTAX').studyInstanceUid + '.1.1']));
  const allowed = new Set([
    new URL(page.url()).origin,
    new URL(process.env.VITE_VIEWER_ORIGIN!).origin,
  ]);
  expect(
    requested.filter((url) => /^https?:/.test(url) && !allowed.has(new URL(url).origin)),
  ).toEqual([]);
  await expect(findings).toHaveValue('Unsaved format observations retained.');
});

test('real API approved tools: window/level, zoom, pan, reset and length in mm', async ({
  page,
}) => {
  const uid = (suffix: string) => fixture('GEO').studyInstanceUid + '.' + suffix;
  await connect(page, 'GEO');
  const findings = page.getByLabel('Findings', { exact: true });
  await findings.fill('Unsaved tool observations retained.');
  await openViewer(page);
  await expect(page.locator('iframe[title="Synthetic OHIF viewer"]')).toHaveAttribute(
    'data-rendered',
    'true',
    { timeout: 60000 },
  );
  await expectOnlyApprovedChrome(page);
  const tools = page.getByRole('group', { name: 'Viewer tools' });
  await expect(tools.getByRole('button', { name: 'Window/level' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const image = page.getByTestId('viewer-image');
  await expect(image).toHaveText(uid('1.2'));
  // Reset gives the default view of the image on screen; take that as the baseline once the
  // viewer has settled on planned slice 1.
  await settledViewState(page);
  await expect(image).toHaveText(uid('1.2'));
  await tools.getByRole('button', { name: 'Reset view' }).click();
  const initial = await settledViewState(page);
  expect(initial.tool).toBe('WindowLevel');
  await dragFromCentre(page, 80, 0);
  await expect.poll(async () => (await viewState(page)).upper).not.toBe(initial.upper);
  await tools.getByRole('button', { name: 'Zoom' }).click();
  await expect.poll(async () => (await viewState(page)).tool).toBe('Zoom');
  await dragFromCentre(page, 0, -80);
  await expect.poll(async () => (await viewState(page)).scale).not.toBe(initial.scale);
  await tools.getByRole('button', { name: 'Pan' }).click();
  await expect.poll(async () => (await viewState(page)).tool).toBe('Pan');
  await dragFromCentre(page, 40, 30);
  await expect.poll(async () => (await viewState(page)).focal).not.toEqual(initial.focal);
  await expect(image).toHaveText(uid('1.2'));
  await tools.getByRole('button', { name: 'Reset view' }).click();
  await expect
    .poll(async () => {
      const now = await viewState(page);
      return [now.lower, now.upper, now.scale, now.focal];
    })
    .toEqual([initial.lower, initial.upper, initial.scale, initial.focal]);
  // Keyboard only: activate Length without a pointer.
  await page.getByRole('button', { name: 'Next slice' }).click();
  await expect(image).toHaveText(uid('1.3'));
  await tools.getByRole('button', { name: 'Length' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await viewState(page)).tool).toBe('Length');
  await expect(page.getByTestId('viewer-measurement')).toHaveText(
    'No measurement on this image. Select Length and drag on the image.',
  );
  // 40 columns x 0.75 mm = 30.0 mm on the axial slice at z = 2 mm.
  await dragImage(page, [10, 10], [50, 10]);
  await expectLength(page, 30, uid('1.3'));
  await page.getByLabel('Series').selectOption('2');
  await expect(image).toHaveText(uid('2.2'));
  // A length from another image is not shown against this one.
  await expect(page.getByTestId('viewer-measurement')).toHaveText(
    'No measurement on this image. Select Length and drag on the image.',
  );
  // 20 columns x 1.0 mm column spacing (Pixel Spacing 0.5\1.0) = 20.0 mm.
  await dragImage(page, [10, 10], [30, 10]);
  await expectLength(page, 20, uid('2.2'));
  await page.getByLabel('Series').selectOption('3');
  await expect(image).toHaveText(uid('3.1'));
  await expect(tools.getByRole('button', { name: 'Length' })).toBeDisabled();
  // No number at all on an image without pixel spacing, even after an earlier measurement.
  await expect(page.getByTestId('viewer-measurement')).toHaveText(
    'Measurement unavailable: pixel spacing missing',
  );
  await expect(page.getByTestId('viewer-measurement')).not.toContainText('mm');
  // Returning to the measured image shows its length again.
  await page.getByLabel('Series').selectOption('2');
  await expectLength(page, 20, uid('2.2'));
  await page.getByLabel('Series').selectOption('3');
  await expect(image).toHaveText(uid('3.1'));
  await expect(tools.getByRole('button', { name: 'Window/level' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect((await viewState(page)).tool).toBe('WindowLevel');
  await expect(findings).toHaveValue('Unsaved tool observations retained.');
  await page.getByRole('button', { name: 'Close viewer proof' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(findings).toHaveValue('Unsaved tool observations retained.');
  await openViewer(page);
  await expect(page.locator('iframe[title="Synthetic OHIF viewer"]')).toHaveAttribute(
    'data-rendered',
    'true',
    { timeout: 60000 },
  );
  await expect(page.getByTestId('viewer-measurement')).toHaveText(
    'No measurement on this image. Select Length and drag on the image.',
  );
});
