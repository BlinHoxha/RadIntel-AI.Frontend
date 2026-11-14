import { test, expect, type Page } from '@playwright/test';
import { fixture } from '../viewer/synthetic.mjs';
import {
  dragFromCentre,
  dragImage,
  expectLength,
  expectOnlyApprovedChrome,
  settledViewState,
  viewState,
} from '../e2e-viewer/tools';

// Demo-mode coverage of the M07B fixtures through the MSW synthetic API and the pinned OHIF host.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore demo workspace' }).click();
  await expect(page.getByRole('heading', { name: 'A clearer view of your day.' })).toBeVisible();
});
function recordFrames(page: Page) {
  const frames: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/viewer-frames'))
      frames.push((request.postDataJSON() as { sopInstanceUid: string }).sopInstanceUid);
  });
  return frames;
}
async function openStudy(page: Page, label: string) {
  await page.getByRole('link', { name: 'Study worklist', exact: true }).click();
  await page.getByRole('button', { name: 'Open study: ' + label }).click();
}
async function openViewer(page: Page) {
  await page.locator('.study-link').first().click();
  await page.getByRole('button', { name: 'Open synthetic viewer proof' }).click();
  const child = page.frameLocator('iframe[title="Synthetic OHIF viewer"]');
  const confirm = child.getByRole('button', { name: 'Confirm and hide' });
  if (await confirm.isVisible({ timeout: 5000 }).catch(() => false)) await confirm.click();
}
const viewerAlert = (page: Page) =>
  page.getByRole('region', { name: 'Synthetic OHIF viewer proof' }).getByRole('alert');

test('demo geometry study: verified order, labels, warnings, navigation and draft retention', async ({
  page,
}) => {
  const uid = (suffix: string) => fixture('GEO').studyInstanceUid + '.' + suffix;
  const frames = recordFrames(page);
  await openStudy(page, 'Abdomen & pelvis Demo Robin Parker');
  await page.getByRole('button', { name: 'Claim study', exact: true }).click();
  await page.getByRole('button', { name: 'Create report', exact: true }).click();
  const findings = page.getByLabel('Findings', { exact: true });
  await findings.fill('Unsaved demo geometry observations.');
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
  await expect(image).toHaveText(uid('1.2'));
  await expect(page.getByTestId('viewer-slice')).toHaveText('1 of 3');
  await expect(page.getByTestId('viewer-orientation')).toHaveText(
    'Left R, right L, top A, bottom P',
  );
  const next = page.getByRole('button', { name: 'Next slice' });
  await next.click();
  await expect(image).toHaveText(uid('1.3'));
  await expect(page.getByTestId('viewer-position')).toHaveText('(0.0, 0.0, 2.0) mm');
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(image).toHaveText(uid('1.1'));
  await expect(page.getByTestId('viewer-slice')).toHaveText('3 of 3');
  await page.getByLabel('Series').selectOption('2');
  await expect(image).toHaveText(uid('2.2'));
  await expect(page.getByTestId('viewer-orientation')).toHaveText(
    'Left R, right L, top H, bottom F',
  );
  await expect(page.getByTestId('viewer-spacing')).toHaveText(
    '0.5 mm between rows × 1 mm between columns',
  );
  await page.getByLabel('Series').selectOption('3');
  await expect(page.getByTestId('viewer-spacing')).toHaveText(
    'Measurement unavailable: pixel spacing missing',
  );
  const allowed = new Set(['1.1', '1.2', '1.3', '2.1', '2.2', '3.1'].map(uid));
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.filter((sop) => !allowed.has(sop))).toEqual([]);
  await expect(findings).toHaveValue('Unsaved demo geometry observations.');
  await page.getByRole('button', { name: 'Close viewer proof' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(findings).toHaveValue('Unsaved demo geometry observations.');
});

test('demo identity mismatch: viewer unavailable and no pixels requested', async ({ page }) => {
  const frames = recordFrames(page);
  await openStudy(page, 'Head Demo Avery Blake');
  await openViewer(page);
  await expect(viewerAlert(page)).toHaveText(
    'Viewer unavailable: the image identity or format could not be verified. Manual reporting remains available.',
    { timeout: 30000 },
  );
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(frames).toEqual([]);
});

test('demo unsupported transfer syntax: format message and no image', async ({ page }) => {
  const frames = recordFrames(page);
  await openStudy(page, 'Left wrist Demo Jamie Quinn');
  await openViewer(page);
  await expect(viewerAlert(page)).toHaveText(
    'Image could not be shown: unsupported image format or image service unavailable. Manual reporting remains available.',
    { timeout: 60000 },
  );
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(new Set(frames)).toEqual(new Set([fixture('TSYNTAX').studyInstanceUid + '.1.1']));
});

test('demo approved tools: window/level, zoom, pan, reset and length in mm', async ({ page }) => {
  const uid = (suffix: string) => fixture('GEO').studyInstanceUid + '.' + suffix;
  await openStudy(page, 'Abdomen & pelvis Demo Robin Parker');
  await page.getByRole('button', { name: 'Claim study', exact: true }).click();
  await page.getByRole('button', { name: 'Create report', exact: true }).click();
  const findings = page.getByLabel('Findings', { exact: true });
  await findings.fill('Unsaved demo tool observations.');
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
  await expect(findings).toHaveValue('Unsaved demo tool observations.');
  await page.getByRole('button', { name: 'Close viewer proof' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(findings).toHaveValue('Unsaved demo tool observations.');
  await page.getByRole('button', { name: 'Open synthetic viewer proof' }).click();
  await expect(page.locator('iframe[title="Synthetic OHIF viewer"]')).toHaveAttribute(
    'data-rendered',
    'true',
    { timeout: 60000 },
  );
  await expect(page.getByTestId('viewer-measurement')).toHaveText(
    'No measurement on this image. Select Length and drag on the image.',
  );
});
