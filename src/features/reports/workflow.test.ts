import { describe, expect, it } from 'vitest';
import { clearCredentials, facilityPath, request, setCredentials } from '../../shared/api/client';
import type { Order, Page, Report, ReportDetail, Session } from '../../shared/api/types';
import { facilityId } from '../../test/mocks/handlers';
const path = (value: string) => facilityPath(facilityId, value);
describe('synthetic contract scenarios', () => {
  it('claims, drafts, reviews, signs and prevents signed edits', async () => {
    setCredentials('synthetic-demo', () => {});
    const list = await request<Page<Order>>(path('worklist'));
    const order = list.items.find((o) => o.status === 'Acquired')!;
    const claimed = await request<Order>(path(`imaging-orders/${order.id}/claim`), 'POST', {
      expectedToken: order.concurrencyToken,
    });
    const report = await request<Report>(path(`imaging-orders/${order.id}/reports`), 'POST', {
      expectedToken: claimed.concurrencyToken,
    });
    const content = {
      examination: 'Synthetic CT',
      findings: 'Synthetic observations',
      impression: 'Synthetic conclusion',
      language: 'en',
    };
    await expect(
      request(path(`reports/${report.id}/drafts`), 'POST', { ...content, expectedToken: 'stale' }),
    ).rejects.toMatchObject({ status: 409 });
    const saved = await request<Report>(path(`reports/${report.id}/drafts`), 'POST', {
      ...content,
      expectedToken: report.concurrencyToken,
    });
    expect(saved.status).toBe('Draft');
    await expect(
      request(path(`reports/${report.id}/sign`), 'POST', {
        expectedToken: saved.concurrencyToken,
        requestKey: 'early',
      }),
    ).rejects.toMatchObject({ status: 409 });
    const submitted = await request<Report>(path(`reports/${report.id}/submit`), 'POST', {
      expectedToken: saved.concurrencyToken,
    });
    const signature = await request(path(`reports/${report.id}/sign`), 'POST', {
      expectedToken: submitted.concurrencyToken,
      requestKey: 'signature-1',
    });
    const replay = await request(path(`reports/${report.id}/sign`), 'POST', {
      expectedToken: submitted.concurrencyToken,
      requestKey: 'signature-1',
    });
    expect(replay).toEqual(signature);
    const detail = await request<ReportDetail>(path(`reports/${report.id}`));
    expect(detail.report.status).toBe('Signed');
    await expect(
      request(path(`reports/${report.id}/drafts`), 'POST', {
        ...content,
        expectedToken: detail.report.concurrencyToken,
      }),
    ).rejects.toMatchObject({ status: 409 });
    clearCredentials();
  });
  it('does not let a technician claim a study or use report endpoints', async () => {
    setCredentials('synthetic-demo-technician', () => {});
    const session = await request<Session>('session');
    expect(session.facilities[0].roles).toBe(4);
    const list = await request<Page<Order>>(path('worklist'));
    const order = list.items.find((o) => o.status === 'Acquired')!;
    await expect(
      request(path(`imaging-orders/${order.id}/claim`), 'POST', {
        expectedToken: order.concurrencyToken,
      }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(request(path('reports/arbitrary'))).rejects.toMatchObject({ status: 403 });
  });
  it('isolates facilities and blocks unsigned export', async () => {
    setCredentials('synthetic-demo', () => {});
    await expect(request(facilityPath('other', 'worklist'))).rejects.toMatchObject({ status: 404 });
    const list = await request<Page<Order>>(path('worklist'));
    const order = list.items.find((o) => o.status === 'ReportDraft')!;
    const reports = await request<Report[]>(path(`imaging-orders/${order.id}/reports`));
    await expect(request(path(`reports/${reports[0].id}/export`))).rejects.toMatchObject({
      status: 409,
    });
  });
});
