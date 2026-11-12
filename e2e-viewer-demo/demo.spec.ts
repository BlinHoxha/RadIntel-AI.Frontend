import { test, expect, type Page } from '@playwright/test';
import { fixture } from '../viewer/synthetic.mjs';

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
