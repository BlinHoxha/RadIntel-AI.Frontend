import { lazy, Suspense, useState } from 'react';
import { viewerProofEnabled } from './viewerProofConfig';
const ViewerProof = lazy(() => import('./ViewerProof'));
import { useMutation, useQuery } from '@tanstack/react-query';
import { ScanLine, Link2, Database } from 'lucide-react';
import { useAuth } from '../../shared/auth/Auth';
import { facilityPath, request } from '../../shared/api/client';
import type { Order, Study } from '../../shared/api/types';
import { Badge, Empty, ErrorBox, Loading } from '../../shared/ui';
// Isolated adapter: a future diagnostic viewer must use this authorized backend boundary.
export const imagingAdapter = {
  studies: (facilityId: string, orderId: string) =>
    request<Study[]>(facilityPath(facilityId, `imaging-orders/${orderId}/studies`)),
  metadata: (facilityId: string, studyId: string) =>
    request<unknown>(facilityPath(facilityId, `studies/${studyId}/dicomweb/metadata`)),
};
export default function ImagingPanel({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: () => Promise<void>;
}) {
  const auth = useAuth();
  const [studyId, setStudyId] = useState('');
  const [proofStudy, setProofStudy] = useState('');
  const [archiveKey, setArchiveKey] = useState('');
  const [uid, setUid] = useState('');
  const [linking, setLinking] = useState(false);
  const permitted =
    !!(auth.roles & 4) || (!!(auth.roles & 8) && order.assignedTo === auth.session?.userId);
  const studies = useQuery({
    queryKey: [auth.facilityId, 'studies', order.id],
    queryFn: () => imagingAdapter.studies(auth.facilityId, order.id),
    enabled: permitted,
  });
  const archives = useQuery({
    queryKey: [auth.facilityId, 'archives'],
    queryFn: () =>
      request<{ key: string; name: string }[]>(facilityPath(auth.facilityId, 'archives')),
    enabled: permitted,
  });
  const metadata = useQuery({
    queryKey: [auth.facilityId, 'metadata', studyId],
    queryFn: () => imagingAdapter.metadata(auth.facilityId, studyId),
    enabled: !!studyId,
  });
  const link = useMutation({
    mutationFn: () =>
      request(facilityPath(auth.facilityId, `imaging-orders/${order.id}/studies`), 'POST', {
        expectedToken: order.concurrencyToken,
        archiveKey,
        studyInstanceUid: uid,
      }),
    onSuccess: async () => {
      setLinking(false);
      await studies.refetch();
      await onUpdated();
    },
  });
  return (
    <section className="panel imaging-panel">
      <div className="panel-header">
        <div>
          <h2>
            <ScanLine size={19} />
            Imaging & study context
          </h2>
          <p>
            Image availability: unknown. Processing is not tracked. Linked metadata does not confirm
            image readiness.
          </p>
        </div>
        <Badge>{viewerProofEnabled ? 'Synthetic proof available' : 'Metadata only'}</Badge>
      </div>
      <div className="viewer-placeholder">
        <div className="scan-grid">
          <ScanLine size={64} strokeWidth={1} />
        </div>
        <h3>Your imaging connection</h3>
        <p>
          {viewerProofEnabled
            ? 'Synthetic viewing is available for supported linked studies.'
            : 'A diagnostic viewer is not configured.'}
          <br />
          Review images in your institution’s approved viewer.
        </p>
        <Badge tone="blue">Manual reporting remains available</Badge>
      </div>
      {proofStudy && (
        <Suspense fallback={<Loading />}>
          <ViewerProof
            key={auth.facilityId + order.id + proofStudy}
            facilityId={auth.facilityId}
            orderId={order.id}
            studyId={proofStudy}
            onClose={() => setProofStudy('')}
          />
        </Suspense>
      )}
      <div className="imaging-details">
        <h3>
          <Database size={16} />
          Linked PACS studies
        </h3>
        {!permitted ? (
          <Empty>PACS access requires a technician or the assigned radiologist.</Empty>
        ) : studies.isPending ? (
          <Loading />
        ) : studies.error ? (
          <ErrorBox error={studies.error} />
        ) : (
          <>
            {studies.data?.map((study) => (
              <button
                className={`study-link ${studyId === study.id ? 'selected' : ''}`}
                key={study.id}
                onClick={() => setStudyId(study.id)}
              >
                <Database size={17} />
                <span>
                  <strong>{study.archiveKey}</strong>
                  <small>{study.studyInstanceUid}</small>
                </span>
              </button>
            ))}
            {!studies.data?.length && <Empty>No studies linked.</Empty>}
          </>
        )}
        {viewerProofEnabled && permitted && studyId && !proofStudy && (
          <button type="button" onClick={() => setProofStudy(studyId)}>
            Open synthetic viewer proof
          </button>
        )}
        {permitted && ['Acquired', 'InReview', 'ReportDraft'].includes(order.status) && (
          <button
            className="desktop-action"
            disabled={!order.concurrencyToken}
            onClick={() => setLinking(!linking)}
          >
            <Link2 size={16} />
            Link verified study
          </button>
        )}
        {linking && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              link.mutate();
            }}
          >
            <label>
              Archive
              <select
                required
                value={archiveKey}
                onChange={(event) => setArchiveKey(event.target.value)}
              >
                <option value="">Choose archive</option>
                {archives.data?.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Study Instance UID
              <input
                required
                maxLength={64}
                value={uid}
                onChange={(event) => setUid(event.target.value)}
              />
            </label>
            <button disabled={link.isPending}>Verify patient & link</button>
          </form>
        )}
        {archives.error && <ErrorBox error={archives.error} />}{' '}
        {link.error && <ErrorBox error={link.error} />} {metadata.isFetching && <Loading />}
        {metadata.error && <ErrorBox error={metadata.error} />}{' '}
        {metadata.data !== undefined && (
          <details open>
            <summary>Authorized study metadata</summary>
            <pre>{JSON.stringify(metadata.data, null, 2)}</pre>
          </details>
        )}
        <div className="viewer-note">
          {viewerProofEnabled
            ? 'The local OHIF proof is limited to synthetic images. Vendor verification and clinician acceptance remain pending.'
            : 'No diagnostic image rendering or measurements are supplied by this frontend. OHIF integration, vendor verification and clinician acceptance remain pending.'}
        </div>
      </div>
    </section>
  );
}
