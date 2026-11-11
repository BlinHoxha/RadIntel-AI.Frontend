import {
  test,
  expect,
  request as apiRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { randomUUID } from 'node:crypto';
let api: APIRequestContext;
let tenant: string;
let facility: string;
let order: { id: string; concurrencyToken: string };
const token = process.env.RADINTEL_TEST_API_TOKEN;
const origin = process.env.RADINTEL_TEST_API_URL;
if (!token || !origin || !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname))
  throw new Error('Run through npm run test:integration with an isolated test API.');
async function post(path: string, data: unknown) {
  const response = await api.post(path, { data });
  expect(response.ok(), `Synthetic API command returned ${response.status()}`).toBeTruthy();
  return response.json();
}
async function connect(page: Page, openStudy = true) {
  await page.goto('/');
  await page.getByLabel('Access token', { exact: true }).fill(token!);
  await page.getByLabel('Development user ID').fill('browser-owner');
  await page.getByLabel('Organization UUID').fill(tenant);
  await page
    .getByRole('checkbox', { name: 'Simulate recent MFA for local workflow tests' })
    .check();
  await page.getByRole('button', { name: 'Connect to institution' }).click();
  if (openStudy)
    await page.getByRole('button', { name: 'Open study: Chest Synthetic Browser Patient' }).click();
}
test.beforeEach(async () => {
  tenant = randomUUID();
  api = await apiRequest.newContext({
    baseURL: origin,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'X-RadIntel-User': 'browser-owner',
      'X-RadIntel-Tenant': tenant,
      'X-RadIntel-Mfa': 'true',
    },
  });
  facility = (
    await post('/api/v1/organizations/onboard', {
      organizationName: 'Synthetic Browser Organization',
      facilityName: 'Synthetic Browser Facility',
      timeZone: 'UTC',
    })
  ).facilityId;
  const root = `/api/v1/facilities/${facility}`;
  const patient = await post(`${root}/patients`, {
    identifier: `SYN-${randomUUID()}`,
    identifierIssuer: 'SYNTHETIC',
    displayName: 'Synthetic Browser Patient',
    birthDate: null,
  });
  order = await post(`${root}/imaging-orders`, {
    patientId: patient.id,
    modality: 'CT',
    bodyRegion: 'Chest',
    referral: 'Synthetic browser scenario',
    priority: 'Routine',
  });
  for (const status of ['CheckedIn', 'Acquired'])
    order = await post(`${root}/imaging-orders/${order.id}/transition`, {
      expectedToken: order.concurrencyToken,
      status,
      reason: 'Synthetic acquisition',
    });
});
test.afterEach(async () => {
  await api.dispose();
});

test('real PostgreSQL API: claim, manual draft, checked proposal, review, signature and export', async ({
  page,
}) => {
  const root = `/api/v1/facilities/${facility}`;
  const template = await post(`${root}/templates`, {
    name: 'Synthetic CT Chest',
    language: 'en',
    modality: 'CT',
    bodyRegion: 'Chest',
    structure: 'Examination, Findings, Impression',
    version: 1,
  });
  await post(`${root}/templates/${template.id}/publish`, {
    expectedToken: template.concurrencyToken,
  });
  await connect(page);
  await page.getByRole('button', { name: 'Claim study', exact: true }).click();
  await page.getByRole('button', { name: 'Create report', exact: true }).click();
  await page.getByLabel('Examination', { exact: true }).fill('Synthetic CT Chest');
  await page
    .getByLabel('Clinical indication (optional)', { exact: true })
    .fill('Synthetic clinical indication');
  await page.getByLabel('Technique (optional)', { exact: true }).fill('Synthetic technique');
  await page.getByLabel('Findings', { exact: true }).fill('Manual synthetic observations');
  await page
    .getByLabel('Impression', { exact: true })
    .fill('Clinician-authored synthetic impression');
  const savedRevision = page.waitForResponse(
    (response) => response.url().endsWith('/drafts') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save revision' }).click();
  expect((await savedRevision).ok()).toBeTruthy();
  await expect(page.getByText('Revision saved to server.')).toBeVisible();
  await page.getByRole('button', { name: 'Draft assistance', exact: true }).click();
  await page.getByLabel('Original observations').fill('Original synthetic observations');
  await page
    .getByLabel('Clinician-checked observations')
    .fill('Exact checked synthetic observations');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save checked input' }).click();
  await expect(page.getByText('Checked input saved. Prior proposals are stale.')).toBeVisible();
  await page
    .getByLabel('Published source template')
    .selectOption({ label: 'Synthetic CT Chest · en · v1' });
  await page.getByRole('button', { name: 'Request draft proposal' }).click();
  await expect(page.getByText('Unverified AI proposal')).toBeVisible();
  await expect(page.getByLabel('Clinical indication (optional)', { exact: true })).toHaveValue(
    'Synthetic clinical indication',
  );
  await page.getByRole('button', { name: 'Accept into draft' }).click();
  await page.getByRole('button', { name: 'Report composer', exact: true }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Exact checked synthetic observations',
  );
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await page.getByRole('button', { name: 'Review & sign' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Sign revision 2', exact: true }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toBeDisabled();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export signed text' }).click();
  expect((await download).suggestedFilename()).toMatch(/^report-.*\.txt$/);
  const reports = await (await api.get(`${root}/imaging-orders/${order.id}/reports`)).json();
  const detail = await (await api.get(`${root}/reports/${reports[0].id}`)).json();
  expect(detail.report.status).toBe('Signed');
  expect(detail.signatures).toHaveLength(1);
  expect(detail.versions.at(-1).findings).toBe('Exact checked synthetic observations');
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  const outsider = await apiRequest.newContext({
    baseURL: origin,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'X-RadIntel-User': 'outsider',
      'X-RadIntel-Tenant': randomUUID(),
    },
  });
  expect((await outsider.get(`${root}/patients`)).status()).toBe(403);
  await outsider.dispose();
});

test('real API conflict preserves unsaved editor text', async ({ page, context }) => {
  const root = `/api/v1/facilities/${facility}`;
  const claimed = await post(`${root}/imaging-orders/${order.id}/claim`, {
    expectedToken: order.concurrencyToken,
  });
  const report = await post(`${root}/imaging-orders/${order.id}/reports`, {
    expectedToken: claimed.concurrencyToken,
  });
  await post(`${root}/reports/${report.id}/drafts`, {
    expectedToken: report.concurrencyToken,
    examination: 'Synthetic CT',
    findings: 'Original findings',
    impression: 'Original impression',
    language: 'en',
  });
  await connect(page);
  const second = await context.newPage();
  await connect(second);
  // Both editors must have loaded the same saved revision before either writes.
  // A navigation click alone can finish before the second report fetch resolves.
  await expect(second.getByLabel('Findings', { exact: true })).toHaveValue('Original findings');
  await page.getByLabel('Findings', { exact: true }).fill('First editor changes');
  await page.getByRole('button', { name: 'Save revision' }).click();
  await expect(page.getByText('Revision saved to server.')).toBeVisible();
  await second.getByLabel('Findings', { exact: true }).fill('Second editor unsaved changes');
  await second.getByLabel('Impression', { exact: true }).fill('Local impression to compare');
  const conflictResponse = second.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/reports/${report.id}/drafts`),
  );
  await second.getByRole('button', { name: 'Save revision' }).click();
  expect((await conflictResponse).status()).toBe(409);
  await expect(second.getByRole('alert')).toContainText('record changed');
  await expect(second.getByLabel('Findings', { exact: true })).toHaveValue(
    'Second editor unsaved changes',
  );
  await second.getByRole('button', { name: 'Reload server version', exact: true }).click();
  await expect(second.getByLabel('Findings', { exact: true })).toHaveValue(
    'Second editor unsaved changes',
  );
  await expect(second.getByLabel('Server findings', { exact: true })).toHaveText(
    'First editor changes',
  );
  await expect(second.getByRole('button', { name: 'Save revision' })).toBeDisabled();
  await second.getByRole('button', { name: 'Use server impression', exact: true }).click();
  await expect(second.getByLabel('Impression', { exact: true })).toHaveValue('Original impression');
  await expect(second.getByLabel('Findings', { exact: true })).toHaveValue(
    'Second editor unsaved changes',
  );
  await second.getByRole('button', { name: 'Continue with my reviewed text' }).click();
  await second.getByRole('button', { name: 'Save revision' }).click();
  await expect(second.getByText('Revision saved to server.')).toBeVisible();
  const resolved = await (await api.get(root + '/reports/' + report.id)).json();
  expect(resolved.versions).toHaveLength(3);
  expect(resolved.versions.at(-1).findings).toBe('Second editor unsaved changes');
  expect(resolved.versions.at(-1).impression).toBe('Original impression');
});

test('server search finds studies beyond the first worklist page and resets pagination', async ({
  page,
}) => {
  const root = `/api/v1/facilities/${facility}`;
  const context = await (await api.get(`${root}/imaging-orders/${order.id}/context`)).json();
  for (let index = 0; index < 22; index++)
    await post(`${root}/imaging-orders`, {
      patientId: context.order.patientId,
      modality: 'MR',
      bodyRegion: `Synthetic brain ${index}`,
      referral: 'Synthetic pagination case',
      priority: 'Routine',
    });
  await connect(page, false);
  await expect(
    page.getByRole('button', { name: 'Open study: Chest Synthetic Browser Patient' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Open study: Chest Synthetic Browser Patient' }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Search authorized patients or studies' }).fill('Chest');
  await expect(page.getByText(/1 shown.*Page 1.*1 matching/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByLabel('Filter modality', { exact: true }).selectOption('MR');
  await expect(page.getByText(/0 shown.*Page 1.*0 matching/)).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
});

test('order picker searches beyond 100 patients and retains the selected patient across searches', async ({
  page,
}) => {
  const root = `/api/v1/facilities/${facility}`;
  for (let index = 0; index < 101; index++)
    await post(`${root}/patients`, {
      identifier: `SYN-PICK-${index}`,
      identifierIssuer: 'SYNTHETIC',
      displayName: `Synthetic Picker ${String(index).padStart(3, '0')}`,
      birthDate: null,
    });
  await connect(page, false);
  await page.getByRole('button', { name: 'New imaging order' }).click();
  await page.getByLabel('Find patient by name or ID').fill('Picker 100');
  await expect(page.getByRole('option', { name: 'Synthetic Picker 100' })).toHaveCount(1);
  const patientOption = await page
    .getByRole('option', { name: 'Synthetic Picker 100' })
    .getAttribute('value');
  await page.getByLabel('Registered patient', { exact: true }).selectOption(patientOption!);
  const selected = await page.getByLabel('Registered patient', { exact: true }).inputValue();
  await page.getByLabel('Find patient by name or ID').fill('Picker 000');
  await expect(page.getByRole('option', { name: 'Synthetic Picker 000' })).toHaveCount(1);
  await expect(page.getByLabel('Registered patient', { exact: true })).toHaveValue(selected);
  await page.getByLabel('Body region', { exact: true }).fill('Synthetic selected case');
  await page.getByRole('button', { name: 'Create imaging order', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Search authorized patients or studies' })
    .fill('Picker 100');
  await expect(
    page.getByRole('button', { name: 'Open study: Synthetic selected case Synthetic Picker 100' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Open study: Synthetic selected case Synthetic Picker 100' })
    .click();
  await expect(page.getByText('Synthetic Picker 100', { exact: true })).toBeVisible();
});

async function syntheticDraft() {
  const root = '/api/v1/facilities/' + facility;
  const claimed = await post(root + '/imaging-orders/' + order.id + '/claim', {
    expectedToken: order.concurrencyToken,
  });
  const created = await post(root + '/imaging-orders/' + order.id + '/reports', {
    expectedToken: claimed.concurrencyToken,
  });
  const content = {
    examination: 'Synthetic CT',
    findings: 'Original observations',
    impression: 'Original impression',
    language: 'en',
  };
  const saved = await post(root + '/reports/' + created.id + '/drafts', {
    expectedToken: created.concurrencyToken,
    ...content,
  });
  return { root, report: saved, content };
}

test('failed comparison fetch retains local text; another server edit requires a new comparison', async ({
  page,
}) => {
  const { root, report, content } = await syntheticDraft();
  const path = root + '/reports/' + report.id;
  await connect(page);
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(content.findings);
  await page.getByLabel('Findings', { exact: true }).fill('Retained local observations');
  const first = await post(path + '/drafts', {
    ...content,
    findings: 'First remote revision',
    expectedToken: report.concurrencyToken,
  });
  await page.getByRole('button', { name: 'Save revision' }).click();
  await expect(
    page.getByRole('button', { name: 'Reload server version', exact: true }),
  ).toBeVisible();
  const pattern = '**' + path;
  await page.route(pattern, async (route) => {
    if (route.request().method() === 'GET')
      await route.fulfill({ status: 503, contentType: 'application/problem+json', body: '{}' });
    else await route.continue();
  });
  await page.getByRole('button', { name: 'Reload server version', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'service is unavailable' })).toBeVisible();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Retained local observations',
  );
  await expect(page.getByRole('button', { name: 'Save revision' })).toBeDisabled();
  await page.unroute(pattern);
  await page.getByRole('button', { name: 'Reload server version', exact: true }).click();
  await expect(page.getByLabel('Server findings', { exact: true })).toHaveText(
    'First remote revision',
  );
  await page.screenshot({ path: 'artifacts/run/report-conflict.png', fullPage: true });

  await post(path + '/drafts', {
    ...content,
    findings: 'Newer remote revision',
    expectedToken: first.concurrencyToken,
  });
  await page.getByRole('button', { name: 'Continue with my reviewed text' }).click();
  await page.getByRole('button', { name: 'Save revision' }).click();
  await expect(
    page.getByRole('button', { name: 'Reload server version', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(
    'Retained local observations',
  );
  await expect(page.getByRole('button', { name: 'Save revision' })).toBeDisabled();
  await page.getByRole('button', { name: 'Reload server version', exact: true }).click();
  await expect(page.getByLabel('Server findings', { exact: true })).toHaveText(
    'Newer remote revision',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('button', { name: 'Continue with my reviewed text' }),
  ).not.toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByRole('button', { name: 'Replace my unsaved text with server revision' }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue('Newer remote revision');
  await expect(page.getByText('Saved version', { exact: true })).toBeVisible();
  const detail = await (await api.get(path)).json();
  expect(detail.versions).toHaveLength(3); // Comparison and replacement never create revisions.
});

test('a report signed elsewhere cannot be overwritten during conflict reconciliation', async ({
  page,
}) => {
  const { root, report, content } = await syntheticDraft();
  const path = root + '/reports/' + report.id;
  await connect(page);
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(content.findings);
  await page.getByLabel('Findings', { exact: true }).fill('Local text retained after signature');
  const submitted = await post(path + '/submit', { expectedToken: report.concurrencyToken });
  const signature = await post(path + '/sign', {
    expectedToken: submitted.concurrencyToken,
    requestKey: randomUUID(),
  });
  await page.getByRole('button', { name: 'Save revision' }).click();
  await page.getByRole('button', { name: 'Reload server version', exact: true }).click();
  await expect(page.getByLabel('Your findings', { exact: true })).toHaveText(
    'Local text retained after signature',
  );
  await expect(page.getByRole('button', { name: 'Continue with my reviewed text' })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Use server findings', exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel('Findings', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Replace my unsaved text with server revision' }).click();
  await expect(page.getByLabel('Findings', { exact: true })).toHaveValue(content.findings);
  const detail = await (await api.get(path)).json();
  expect(detail.versions).toHaveLength(1);
  expect(detail.signatures).toHaveLength(1);
  expect(detail.signatures[0].contentHash).toBe(signature.contentHash);
});

test('optional sections roundtrip with immutable provenance and reject legacy downgrade', async ({
  page,
}) => {
  const { root, report, content } = await syntheticDraft(); // Existing schema-1 report.
  const path = root + '/reports/' + report.id;
  await connect(page);
  await expect(page.getByLabel('Clinical indication (optional)', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Technique (optional)', { exact: true })).toHaveValue('');
  await page
    .getByLabel('Clinical indication (optional)', { exact: true })
    .fill('Synthetic clinical indication');
  await page.getByLabel('Technique (optional)', { exact: true }).fill('Synthetic technique');
  await page.getByRole('button', { name: 'Save revision' }).click();
  await expect(page.getByText('Revision saved to server.')).toBeVisible();
  let detail = await (await api.get(path)).json();
  expect(detail.versions).toHaveLength(2);
  expect(detail.versions[0].contentSchemaVersion).toBe(1);
  const extended = detail.versions[1];
  expect(extended.contentSchemaVersion).toBe(2);
  expect(extended.indication).toBe('Synthetic clinical indication');
  expect(extended.technique).toBe('Synthetic technique');
  expect(extended.provenance.actorId).toBe('browser-owner');
  expect(extended.provenance.baseVersionId).toBe(detail.versions[0].id);

  await page.getByRole('button', { name: 'Version history', exact: true }).click();
  await page
    .locator('.history-list details')
    .filter({ hasText: 'Revision 2' })
    .locator('summary')
    .click();
  const revision = page.locator('.history-list details').filter({ hasText: 'Revision 2' });
  await expect(revision.getByText('Synthetic clinical indication', { exact: true })).toBeVisible();
  await expect(revision.getByRole('region', { name: 'Saved revision provenance' })).toContainText(
    'Manually edited',
  );
  await page.getByRole('button', { name: 'Report composer', exact: true }).click();
  await page.getByLabel('Clinical indication (optional)', { exact: true }).fill('');
  await page.getByLabel('Technique (optional)', { exact: true }).fill('');
  const clearedRevision = page.waitForResponse(
    (response) =>
      response.url().endsWith(path + '/drafts') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save revision' }).click();
  expect((await clearedRevision).ok()).toBeTruthy();
  await expect(page.getByText('Revision saved to server.')).toBeVisible();
  detail = await (await api.get(path)).json();
  expect(detail.versions).toHaveLength(3);
  expect(detail.versions[2].indication).toBeNull();
  expect(detail.versions[2].technique).toBeNull();
  expect(
    detail.versions[2].provenance.sections.find(
      (s: { section: string }) => s.section === 'indication',
    ).origin,
  ).toBe('NotRecorded');
  expect(detail.versions[1].indication).toBe('Synthetic clinical indication');

  const downgrade = await api.post(path + '/drafts', {
    data: { ...content, expectedToken: detail.report.concurrencyToken },
  });
  expect(downgrade.status()).toBe(400);
  const forged = await post(path + '/drafts', {
    ...content,
    expectedToken: detail.report.concurrencyToken,
    contentSchemaVersion: 2,
    indication: 'Explicit indication',
    technique: null,
    provenance: { actorId: 'forged-author', method: 'AcceptedProposal' },
  });
  detail = await (await api.get(path)).json();
  expect(detail.report.concurrencyToken).toBe(forged.concurrencyToken);
  expect(detail.versions.at(-1).provenance.actorId).toBe('browser-owner');
  expect(detail.versions.at(-1).provenance.method).toBe('Manual');
  expect(detail.versions.at(-1).provenance.proposalId).toBeNull();
});
