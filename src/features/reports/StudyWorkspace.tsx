import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Download, FileText, History, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../shared/auth/Auth';
import { useI18n } from '../../shared/i18n';
import { facilityPath, request } from '../../shared/api/client';
import type { Content, Order, OrderContext, Report, ReportDetail } from '../../shared/api/types';
import { Empty, ErrorBox, Loading, Modal } from '../../shared/ui';
import { PageHeading } from '../../app/App';
import { StatusBadge } from '../worklist/Worklist';
import { Assistance } from '../ai/Assistance';
import { ReportConflictReview, type ConflictSnapshot } from './ReportConflictReview';
import { editableContent } from './content';
import { RevisionProvenance } from './RevisionProvenance';
const ImagingPanel = lazy(() => import('../imaging/ImagingPanel'));
const contentSchema = z.object({
  examination: z.string().trim().min(1).max(500),
  findings: z.string().trim().min(1).max(30000),
  impression: z.string().trim().min(1).max(10000),
  language: z.enum(['en', 'sq']),
  indication: z.string().max(4000).optional(),
  technique: z.string().max(4000).optional(),
});
const blank = editableContent();
export function StudyWorkspace({
  order: initialOrder,
  onDirty,
}: {
  order: Order;
  onDirty: (value: boolean) => void;
}) {
  const auth = useAuth();
  const queries = useQueryClient();
  const context = useQuery({
    queryKey: [auth.facilityId, 'order-context', initialOrder.id],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: ({ signal }) =>
      request<OrderContext>(
        facilityPath(auth.facilityId, `imaging-orders/${initialOrder.id}/context`),
        'GET',
        undefined,
        signal,
      ),
  });
  const order = context.data?.order || initialOrder;
  const refreshContext = async () => {
    const result = await context.refetch();
    if (result.error) throw result.error;
    await queries.invalidateQueries({ queryKey: [auth.facilityId, 'worklist'] });
    await queries.invalidateQueries({ queryKey: [auth.facilityId, 'patients'] });
  };
  const [reportId, setReportId] = useState('');
  const [transition, setTransition] = useState('');
  const [reason, setReason] = useState('');
  const patient = context.data?.patient;
  const assigned = order.assignedTo === auth.session?.userId && !!(auth.roles & 8);
  const reports = useQuery({
    queryKey: [auth.facilityId, 'reports', order.id],
    queryFn: ({ signal }) =>
      request<Report[]>(
        facilityPath(auth.facilityId, `imaging-orders/${order.id}/reports`),
        'GET',
        undefined,
        signal,
      ),
    enabled: assigned,
  });
  const command = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) =>
      request<Order | Report>(facilityPath(auth.facilityId, path), 'POST', body),
    onSuccess: async (result, variables) => {
      if (variables.path.endsWith('/reports')) {
        setReportId(result.id);
        void reports.refetch();
      }
      await refreshContext();
      setTransition('');
      setReason('');
      void queries.invalidateQueries({ queryKey: [auth.facilityId, 'worklist'] });
    },
  });
  const run = (suffix: string, body: object = {}) =>
    command.mutate({
      path: `imaging-orders/${order.id}/${suffix}`,
      body: { expectedToken: order.concurrencyToken, ...body },
    });
  const activeReport = reportId || reports.data?.at(-1)?.id;
  if (context.isPending) return <Loading />;
  if (context.error && !context.data)
    return <ErrorBox error={context.error} retry={() => void context.refetch()} />;
  return (
    <>
      <PageHeading
        eyebrow="STUDY WORKSPACE"
        title={`${order.modality} · ${order.bodyRegion}`}
        description="Verify identity and study context before reporting."
      >
        <StatusBadge status={order.status} />
      </PageHeading>
      {context.error && <ErrorBox error={context.error} retry={() => void context.refetch()} />}
      <section className="patient-context">
        <div className="patient-avatar">{patient?.displayName.slice(0, 2) || '—'}</div>
        <div>
          <strong>{patient?.displayName || 'Claim this study to view patient details'}</strong>
          <span>
            {patient
              ? `${patient.identifierIssuer}: ${patient.identifier} · DOB ${patient.birthDate || 'not recorded'}`
              : `Patient reference: ${order.patientId}`}
          </span>
        </div>
        <div className="context-facts">
          <span>
            Priority<strong>{order.priority}</strong>
          </span>
          <span>
            Order<strong>{order.id.slice(0, 8)}</strong>
          </span>
        </div>
      </section>
      <div className="study-actionbar desktop-action">
        {!!(auth.roles & 8) && order.status === 'Acquired' && (
          <button
            className="primary"
            disabled={command.isPending || context.isFetching || !!context.error}
            onClick={() => run('claim')}
          >
            Claim study
          </button>
        )}
        {!!(auth.roles & 3) && ['Requested', 'Scheduled'].includes(order.status) && (
          <button
            disabled={command.isPending || context.isFetching || !!context.error}
            onClick={() => setTransition('CheckedIn')}
          >
            Check in
          </button>
        )}
        {!!(auth.roles & 4) && order.status === 'CheckedIn' && (
          <button
            disabled={command.isPending || context.isFetching || !!context.error}
            onClick={() => setTransition('Acquired')}
          >
            Record acquisition
          </button>
        )}
        {!!(auth.roles & 3) && ['Requested', 'Scheduled'].includes(order.status) && (
          <button
            disabled={command.isPending || context.isFetching || !!context.error}
            onClick={() => setTransition('Cancelled')}
          >
            Cancel order
          </button>
        )}
        {assigned &&
          order.status === 'InReview' &&
          !reports.isPending &&
          !reports.error &&
          !reports.data?.length && (
            <button className="primary" disabled={command.isPending} onClick={() => run('reports')}>
              Create report
            </button>
          )}
        <span className="muted">{order.referral || 'No referral text recorded.'}</span>
      </div>
      {command.error && (
        <ErrorBox
          error={command.error}
          retry={() => {
            void context.refetch().then((result) => {
              if (!result.error) command.reset();
            });
          }}
        />
      )}
      <div className="clinical-layout">
        <Suspense fallback={<Loading />}>
          <ImagingPanel order={order} onUpdated={refreshContext} />
        </Suspense>
        <div className="report-side">
          {reports.data && reports.data.length > 1 && (
            <label>
              Report or addendum
              <select
                value={activeReport}
                onChange={(event) => {
                  if (!window.confirm('Switch report? Save any changes first.')) return;
                  onDirty(false);
                  setReportId(event.target.value);
                }}
              >
                {reports.data.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.kind ? 'Addendum' : 'Original'} · {r.status} · {r.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {assigned ? (
            reports.isPending ? (
              <Loading />
            ) : reports.error ? (
              <ErrorBox error={reports.error} />
            ) : activeReport ? (
              <ReportEditor
                order={order}
                key={activeReport}
                reportId={activeReport}
                patientName={patient?.displayName || order.patientId}
                onDirty={onDirty}
                onContextChanged={refreshContext}
                onAddendum={(id) => {
                  setReportId(id);
                  void reports.refetch();
                }}
              />
            ) : (
              <section className="panel">
                <Empty>Create a report to begin documenting this study.</Empty>
              </section>
            )
          ) : (
            <section className="panel">
              <Empty>
                Reporting is available to the assigned radiologist. Claim an acquired study to
                begin.
              </Empty>
            </section>
          )}
        </div>
      </div>
      {transition && (
        <Modal title={`Record ${transition}`} onClose={() => setTransition('')}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              run('transition', { status: transition, reason });
            }}
          >
            <label>
              Reason
              <textarea
                required
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <button className="primary" disabled={command.isPending}>
              Confirm transition
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

function ReportEditor({
  order,
  reportId,
  patientName,
  onDirty,
  onAddendum,
  onContextChanged,
}: {
  order: Order;
  reportId: string;
  patientName: string;
  onDirty: (value: boolean) => void;
  onAddendum: (id: string) => void;
  onContextChanged: () => Promise<void>;
}) {
  const auth = useAuth();
  const { t, locale } = useI18n();
  const queries = useQueryClient();
  const [tab, setTab] = useState('report');
  const [signing, setSigning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [addendum, setAddendum] = useState(false);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [stale, setStale] = useState(false);
  const [baseVersion, setBaseVersion] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ConflictSnapshot | null>(null);
  const [comparisonError, setComparisonError] = useState<unknown>(null);
  const signKey = useRef(crypto.randomUUID());
  const detail = useQuery({
    queryKey: [auth.facilityId, 'report', reportId],
    queryFn: ({ signal }) =>
      request<ReportDetail>(
        facilityPath(auth.facilityId, `reports/${reportId}`),
        'GET',
        undefined,
        signal,
      ),
    staleTime: Infinity,
  });
  const form = useForm<Content>({ resolver: zodResolver(contentSchema), defaultValues: blank });
  const dirty = form.formState.isDirty;
  const localContent = form.watch();
  const { reset } = form;
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => {
    if (detail.data && !dirty) {
      reset(editableContent(detail.data.versions.at(-1)));
      setBaseVersion(detail.data.report.currentVersion);
    }
  }, [detail.data, reset, dirty]);
  const refresh = useCallback(async () => {
    await detail.refetch();
    await onContextChanged();
    void queries.invalidateQueries({ queryKey: [auth.facilityId, 'worklist'] });
  }, [detail, queries, auth.facilityId, onContextChanged]);
  const command = useMutation({
    mutationFn: ({ suffix, body }: { suffix: string; body: unknown }) =>
      request<Report>(facilityPath(auth.facilityId, `reports/${reportId}/${suffix}`), 'POST', body),
    onSuccess: async (result, variables) => {
      if (variables.suffix === 'addenda') {
        setAddendum(false);
        onAddendum(result.id);
        return;
      }
      if (variables.suffix === 'drafts') {
        form.reset(form.getValues());
        onDirty(false);
      }
      await refresh();
      setStale(false);
      setComparison(null);
      setComparisonError(null);
      setSigning(false);
      setConfirmed(false);
      setNotice(
        variables.suffix === 'sign'
          ? 'This exact revision is signed and immutable.'
          : variables.suffix === 'submit'
            ? 'Saved revision submitted for physician review.'
            : 'Revision saved to server.',
      );
    },
    onError: (error: Error) => {
      if ('status' in error && error.status === 409) {
        setStale(true);
        setComparison(null);
        setComparisonError(null);
        setNotice('');
        setSigning(false);
        setConfirmed(false);
      }
    },
  });
  const exportFile = useMutation({
    mutationFn: async () => {
      const blob = await request<Blob>(facilityPath(auth.facilityId, `reports/${reportId}/export`));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `report-${reportId}.txt`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  });
  if (detail.isPending) return <Loading />;
  if (!detail.data) return <ErrorBox error={detail.error} retry={() => void detail.refetch()} />;
  const { report, versions, signatures } = detail.data;
  const signed = report.status === 'Signed';
  const disabled = signed || command.isPending;
  const run = (suffix: string, body: object = {}) => {
    // Guard the command itself as well as buttons (including implicit form submission).
    if (stale || (signed && suffix !== 'addenda')) return;
    command.mutate({
      suffix,
      body: {
        ...body,
        expectedToken: report.concurrencyToken,
        ...(suffix === 'drafts' ? { contentSchemaVersion: 2 } : {}),
      },
    });
  };
  const loadComparison = async () => {
    setComparison(null);
    setComparisonError(null);
    try {
      const result = await detail.refetch();
      if (result.error || !result.data) {
        setComparisonError(result.error || new Error('Server revision is unavailable.'));
        return;
      }
      const current = result.data;
      const version = current.versions.at(-1);
      setComparison({
        version: current.report.currentVersion,
        token: current.report.concurrencyToken,
        status: current.report.status,
        content: editableContent(version),
        authorId: version?.authorId,
      });
    } catch (error) {
      setComparisonError(error);
    }
  };
  const comparedTokenIsCurrent = comparison?.token === report.concurrencyToken;
  return (
    <section className="panel report-panel">
      <div className="panel-header">
        <div>
          <h2>
            <FileText size={18} />
            {t.report}
          </h2>
          <p>
            Revision {report.currentVersion} · <StatusBadge status={report.status} />
          </p>
        </div>
        <span className={`save-status ${dirty ? 'unsaved' : ''}`}>
          {dirty ? 'Unsaved changes' : 'Saved version'}
        </span>
      </div>
      <div className="report-tabs">
        {[
          ['report', t.report, FileText],
          ['ai', t.ai, Sparkles],
          ['history', t.history, History],
        ].map(([id, label, Icon]) => {
          const TabIcon = Icon as typeof FileText;
          return (
            <button
              key={id as string}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id as string)}
            >
              <TabIcon size={16} />
              {label as string}
            </button>
          );
        })}
      </div>
      {notice && (
        <div className="success-box" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
      {command.error && <ErrorBox error={command.error} />}
      {exportFile.error && <ErrorBox error={exportFile.error} />}
      {detail.error && !stale && (
        <ErrorBox error={detail.error} retry={() => void detail.refetch()} />
      )}
      {stale && (
        <ReportConflictReview
          local={localContent}
          baseVersion={baseVersion}
          snapshot={comparison}
          currentToken={report.concurrencyToken}
          busy={detail.isFetching || command.isPending}
          error={comparisonError}
          onLoad={() => void loadComparison()}
          onUseSection={(field, value) => {
            if (!comparison || !comparedTokenIsCurrent || signed) return;
            form.setValue(field, value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }}
          onKeep={() => {
            if (!comparison || !comparedTokenIsCurrent || signed) return;
            setStale(false);
            setComparison(null);
            command.reset();
            setNotice(
              'Comparison reviewed. Save explicitly to create a new revision with your current text.',
            );
          }}
          onReplace={() => {
            if (!comparison || !comparedTokenIsCurrent) return;
            form.reset(comparison.content);
            setBaseVersion(comparison.version);
            onDirty(false);
            setStale(false);
            setComparison(null);
            command.reset();
            setNotice(
              'Editor replaced with the loaded server revision. No new revision was saved.',
            );
          }}
        />
      )}
      {signed && (
        <div className="signed-notice">
          <ShieldCheck size={18} />
          Signed report · Editing is locked. Corrections require an addendum.
        </div>
      )}
      <div hidden={tab !== 'report'}>
        <form
          className="report-form"
          onSubmit={form.handleSubmit((values) => run('drafts', values))}
        >
          <fieldset disabled={disabled} className="desktop-edit">
            <label>
              Report language
              <select {...form.register('language')}>
                <option value="en">English</option>
                <option value="sq">Shqip</option>
              </select>
            </label>
            {(['indication', 'technique'] as const).map((name) => (
              <label key={name}>
                {name === 'indication' ? 'Clinical indication (optional)' : 'Technique (optional)'}
                <textarea rows={3} maxLength={4000} {...form.register(name)} />
                {form.formState.errors[name] && (
                  <span className="field-error">{form.formState.errors[name]?.message}</span>
                )}
              </label>
            ))}
            {(['examination', 'findings', 'impression'] as const).map((name) => (
              <label key={name}>
                {t[name]}
                {name === 'examination' ? (
                  <input maxLength={500} {...form.register(name)} />
                ) : (
                  <textarea
                    rows={name === 'findings' ? 8 : 4}
                    maxLength={name === 'findings' ? 30000 : 10000}
                    {...form.register(name)}
                  />
                )}{' '}
                {form.formState.errors[name] && (
                  <span className="field-error">{form.formState.errors[name]?.message}</span>
                )}
              </label>
            ))}
          </fieldset>
          <div className="mobile-report">
            <h3>Clinical indication</h3>
            <p>{form.watch('indication') || 'Not recorded'}</p>
            <h3>Technique</h3>
            <p>{form.watch('technique') || 'Not recorded'}</p>
            <h3>{t.examination}</h3>
            <p>{form.watch('examination')}</p>
            <h3>{t.findings}</h3>
            <p>{form.watch('findings')}</p>
            <h3>{t.impression}</h3>
            <p>{form.watch('impression')}</p>
          </div>
          <div className="report-actions desktop-action">
            {!signed && (
              <button className="primary" disabled={disabled || stale}>
                <Save size={16} />
                {t.save}
              </button>
            )}
            {report.status === 'Draft' && (
              <button
                type="button"
                disabled={disabled || dirty || !report.currentVersion || stale}
                onClick={() => run('submit')}
              >
                {t.submit}
              </button>
            )}
            {report.status === 'PendingReview' && (
              <button
                type="button"
                className="sign-button"
                disabled={dirty || command.isPending || stale}
                onClick={() => {
                  setConfirmed(false);
                  setSigning(true);
                }}
              >
                <ShieldCheck size={16} />
                {t.sign}
              </button>
            )}
            {signed && (
              <>
                <button
                  type="button"
                  onClick={() => exportFile.mutate()}
                  disabled={exportFile.isPending}
                >
                  <Download size={16} />
                  Export signed text
                </button>
                {report.kind === 0 && (
                  <button type="button" disabled={stale || dirty} onClick={() => setAddendum(true)}>
                    Create addendum
                  </button>
                )}
              </>
            )}
          </div>
          <p className="fine-print form-note">
            Save explicitly before leaving. Submission and signing apply to the saved revision only.
          </p>
          <RevisionProvenance version={versions.at(-1)} versions={versions} dirty={dirty} />
        </form>
      </div>
      <div hidden={tab !== 'ai'}>
        <Assistance
          order={order}
          report={report}
          dirty={dirty}
          blocked={stale}
          content={form.getValues()}
          onUpdated={refresh}
        />
      </div>
      {tab === 'history' && (
        <div className="history-list">
          {versions.map((version) => (
            <details key={version.id}>
              <summary>
                <span className="timeline-dot" />
                Revision {version.number}
                <span>
                  {new Date(version.createdAt).toLocaleString(locale)} · {version.authorId}
                </span>
              </summary>
              <h4>{t.examination}</h4>
              <p>{version.examination}</p>
              <h4>Clinical indication</h4>
              <p>{version.indication || 'Not recorded'}</p>
              <h4>Technique</h4>
              <p>{version.technique || 'Not recorded'}</p>
              <RevisionProvenance version={version} versions={versions} />
              <h4>{t.findings}</h4>
              <p>{version.findings}</p>
              <h4>{t.impression}</h4>
              <p>{version.impression}</p>
              {signatures
                .filter((s) => s.reportVersionId === version.id)
                .map((s) => (
                  <div className="info-box" key={s.id}>
                    Signed by {s.signedBy}
                    <br />
                    SHA256: <code>{s.contentHash}</code>
                  </div>
                ))}
            </details>
          ))}
          {!versions.length && <Empty>No revisions saved yet.</Empty>}
        </div>
      )}
      {signing && (
        <Modal title="Confirm exact revision signature" onClose={() => setSigning(false)}>
          <div className="info-box">
            <strong>{patientName}</strong>
            <p>
              Report {reportId.slice(0, 8)} · Revision {report.currentVersion}
            </p>
            <p>{versions.at(-1)?.examination}</p>
            {versions.at(-1)?.indication && (
              <p>Clinical indication: {versions.at(-1)?.indication}</p>
            )}
            {versions.at(-1)?.technique && <p>Technique: {versions.at(-1)?.technique}</p>}
          </div>
          <p>
            Review the saved findings and impression before signing. The server requires recent MFA
            and freezes this exact revision.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            I verified patient identity, reviewed the images and saved report, and approve this
            revision.
          </label>
          {!auth.session?.hasRecentMfa && (
            <p className="field-error">
              Recent MFA is not present in this session. Reconnect after completing institution MFA.
            </p>
          )}
          {command.error && <ErrorBox error={command.error} />}
          <button
            className="sign-button"
            disabled={!confirmed || !auth.session?.hasRecentMfa || command.isPending || stale}
            onClick={() => run('sign', { requestKey: signKey.current })}
          >
            Sign revision {report.currentVersion}
          </button>
        </Modal>
      )}
      {addendum && (
        <Modal title="Create an unsigned addendum" onClose={() => setAddendum(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              run('addenda', { reason });
            }}
          >
            <label>
              Reason for correction
              <textarea
                required
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <button className="primary" disabled={command.isPending}>
              Create addendum
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
