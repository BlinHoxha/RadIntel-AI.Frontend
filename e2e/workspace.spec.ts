import { test, expect } from '@playwright/test';
import AxeBuilder from 'axe-core';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore demo workspace' }).click();
  await expect(page.getByRole('heading', { name: 'A clearer view of your day.' })).toBeVisible();
});
test('claim to signed report, confirmation, immutable history and no browser persistence', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open study: Chest Demo Alex Morgan' }).click();
  await page.getByRole('button', { name: 'Claim study', exact: true }).click();
  await page.getByRole('button', { name: 'Create report', exact: true }).click();
  await page.getByLabel('Examination', { exact: true }).fill('Synthetic CT chest');
  await page.getByLabel('Findings', { exact: true }).fill('Synthetic checked findings.');
  await page.getByLabel('Impression', { exact: true }).fill('Synthetic report only.');
  await expect(page.getByRole('button', { name: 'Submit for review' })).toBeDisabled();
  await page.getByRole('button', { name: 'Save revision' }).click();
  await expect(page.getByText('Revision saved to server.')).toBeVisible();
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await page.getByRole('button', { name: 'Review & sign' }).click();
  await expect(page.getByRole('button', { name: 'Sign revision 1', exact: true })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Sign revision 1', exact: true }).click();
  await expect(
    page.getByText('Signed report · Editing is locked.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel('Findings', { exact: true })).toBeDisabled();
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  expect(page.url()).toMatch(/\/study$/);
});
test('dirty edits survive blocked navigation', async ({ page }) => {
  await page.getByRole('button', { name: 'Open study: Brain Demo Sam Taylor' }).click();
  await page.getByLabel('Findings', { exact: true }).fill('Unsaved synthetic text');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('link', { name: 'Patients', exact: true }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue('Unsaved synthetic text');
});
test('English and Albanian navigation and mobile read-only editing', async ({ page }) => {
  await page.getByLabel('Interface language').selectOption('sq');
  await expect(page.getByRole('heading', { name: 'Një pamje më e qartë e ditës.' })).toBeVisible();
  await page.getByLabel('Gjuha e ndërfaqes').selectOption('en');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open study: Brain Demo Sam Taylor' }).click();
  await expect(page.getByRole('button', { name: 'Save revision' })).not.toBeVisible();
  await expect(
    page.getByText('On small screens, this workspace supports read-only review.'),
  ).toBeVisible();
});
test('dashboard app chrome passes automated axe checks', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: 'artifacts/run/dashboard.png', fullPage: true });
  await page.addScriptTag({ content: AxeBuilder.source });
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: typeof AxeBuilder }).axe;
    return (
      await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      })
    ).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }));
  });
  expect(violations).toEqual([]);
});

test('AI assistance stays separate until explicit acceptance', async ({ page }) => {
  await page.getByRole('button', { name: 'Open study: Brain Demo Sam Taylor' }).click();
  await page.getByRole('button', { name: 'Draft assistance', exact: true }).click();
  await page.getByLabel('Original observations').fill('Synthetic source observations');
  await page.getByLabel('Clinician-checked observations').fill('Synthetic checked observations');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save checked input' }).click();
  await page
    .getByLabel('Published source template')
    .selectOption({ label: 'Structured brain report · en · v1' });
  await page.getByRole('button', { name: 'Request draft proposal' }).click();
  await expect(page.getByText('Unverified AI proposal')).toBeVisible();
  await page.getByRole('button', { name: 'Report composer', exact: true }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Synthetic observations for interface testing only.',
  );
  await page.getByRole('button', { name: 'Draft assistance', exact: true }).click();
  await page.getByRole('button', { name: 'Accept into draft' }).click();
  await page.getByRole('button', { name: 'Report composer', exact: true }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Synthetic checked observations',
  );
  await expect(page.getByRole('button', { name: 'Submit for review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review & sign' })).not.toBeVisible();
});

test('patient registration and new imaging order', async ({ page }) => {
  await page.getByRole('link', { name: 'Patients', exact: true }).click();
  await page.getByRole('button', { name: 'Register patient', exact: true }).click();
  await page.getByLabel('Display name').fill('Demo Workflow Patient');
  await page.getByLabel('Patient identifier', { exact: true }).fill('SYN-NEW');
  await page.getByLabel('Identifier issuer', { exact: true }).fill('SYNTHETIC');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Register patient', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Demo Workflow Patient' })).toBeVisible();
  await page.getByRole('link', { name: 'Study worklist', exact: true }).click();
  await page.getByRole('button', { name: 'New imaging order' }).click();
  await page
    .getByLabel('Registered patient')
    .selectOption({ label: 'Demo Workflow Patient · SYN-NEW' });
  await page.getByLabel('Body region', { exact: true }).fill('Synthetic knee');
  await page.getByRole('button', { name: 'Create imaging order', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Open study: Synthetic knee Demo Workflow Patient' }),
  ).toBeVisible();
});
