import { describe, expect, it } from 'vitest';
import { facilityPath, request, setCredentials } from '../../shared/api/client';
import type { Order, Page, Proposal, Report, ReportDetail, Template } from '../../shared/api/types';
import { facilityId } from '../../test/mocks/handlers';
const path = (value: string) => facilityPath(facilityId, value);
async function draft() {
  setCredentials('synthetic-demo', () => {});
  const orders = await request<Page<Order>>(path('worklist'));
  const order = orders.items.find((o) => o.status === 'ReportDraft')!;
  const reports = await request<Report[]>(path(`imaging-orders/${order.id}/reports`));
  const reportId = reports[0].id;
  const transcript = await request<{ id: string }>(
    path(`reports/${reportId}/transcripts`),
    'POST',
    {
      originalText: 'Original synthetic source',
      checkedText: 'Exact clinician-checked synthetic text',
      language: 'en',
      confirmedByRadiologist: true,
    },
  );
  const detail = await request<ReportDetail>(path(`reports/${reportId}`));
  const templates = await request<Template[]>(path('templates'));
  return {
    report: detail.report,
    transcript,
    template: templates.find(
      (t) => t.modality === 'MR' && t.bodyRegion === 'Brain' && t.language === 'en',
    )!,
  };
}
async function proposal() {
  const c = await draft();
  const value = await request<Proposal>(path(`reports/${c.report.id}/ai-draft`), 'POST', {
    expectedToken: c.report.concurrencyToken,
    transcriptId: c.transcript.id,
    templateId: c.template.id,
  });
  return { ...c, proposal: value };
}
describe('proposal contract parity', () => {
  it.each(['modality', 'bodyRegion', 'language'] as const)(
    'rejects incompatible template %s',
    async (field) => {
      const c = await draft();
      const created = await request<Template>(path('templates'), 'POST', {
        name: `Synthetic mismatch ${field}`,
        modality: 'MR',
        bodyRegion: 'Brain',
        language: 'en',
        version: 1,
        structure: 'Findings and impression',
        [field]: { modality: 'CT', bodyRegion: 'Chest', language: 'sq' }[field],
      });
      await request(path(`templates/${created.id}/publish`), 'POST', {
        expectedToken: created.concurrencyToken,
      });
      await expect(
        request(path(`reports/${c.report.id}/ai-draft`), 'POST', {
          expectedToken: c.report.concurrencyToken,
          transcriptId: c.transcript.id,
          templateId: created.id,
        }),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
  it('preserves checked findings verbatim and does not insert them before acceptance', async () => {
    const c = await proposal();
    expect(c.proposal.findings).toBe('Exact clinician-checked synthetic text');
    const before = await request<ReportDetail>(path(`reports/${c.report.id}`));
    expect(before.versions.at(-1)!.findings).not.toBe(c.proposal.findings);
    await request(path(`reports/${c.report.id}/proposals/${c.proposal.id}/review`), 'POST', {
      expectedToken: c.report.concurrencyToken,
      accept: true,
      examination: 'MR Brain',
      impression: 'Clinician-authored synthetic impression',
    });
    const after = await request<ReportDetail>(path(`reports/${c.report.id}`));
    expect(after.report.status).toBe('Draft');
    expect(after.versions.at(-1)!.findings).toBe(c.proposal.findings);
  });
  it('rejects a proposal after a newer report revision', async () => {
    const c = await proposal();
    const newer = await request<Report>(path(`reports/${c.report.id}/drafts`), 'POST', {
      expectedToken: c.report.concurrencyToken,
      examination: 'MR Brain',
      findings: 'New manual observations',
      impression: 'Manual impression',
      language: 'en',
    });
    await expect(
      request(path(`reports/${c.report.id}/proposals/${c.proposal.id}/review`), 'POST', {
        expectedToken: newer.concurrencyToken,
        accept: true,
        examination: 'MR Brain',
        impression: 'Impression',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it('rejects revoked or republished source evidence', async () => {
    const c = await proposal();
    const revoked = await request<Template>(path(`templates/${c.template.id}/revoke`), 'POST', {
      expectedToken: c.template.concurrencyToken,
    });
    const body = {
      expectedToken: c.report.concurrencyToken,
      accept: true,
      examination: 'MR Brain',
      impression: 'Impression',
    };
    const review = path(`reports/${c.report.id}/proposals/${c.proposal.id}/review`);
    await expect(request(review, 'POST', body)).rejects.toMatchObject({ status: 409 });
    await request(path(`templates/${revoked.id}/publish`), 'POST', {
      expectedToken: revoked.concurrencyToken,
    });
    await expect(request(review, 'POST', body)).rejects.toMatchObject({ status: 409 });
  });
  it('does not replay a signature key onto a different report', async () => {
    const c = await draft();
    const pending = await request<Report>(path(`reports/${c.report.id}/submit`), 'POST', {
      expectedToken: c.report.concurrencyToken,
    });
    await request(path(`reports/${c.report.id}/sign`), 'POST', {
      expectedToken: pending.concurrencyToken,
      requestKey: 'synthetic-replay-key',
    });
    const detail = await request<ReportDetail>(path(`reports/${c.report.id}`));
    const addendum = await request<Report>(path(`reports/${c.report.id}/addenda`), 'POST', {
      expectedToken: detail.report.concurrencyToken,
      reason: 'Synthetic correction',
    });
    await expect(
      request(path(`reports/${addendum.id}/sign`), 'POST', {
        expectedToken: addendum.concurrencyToken,
        requestKey: 'synthetic-replay-key',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
