import type { Content, Report } from '../../shared/api/types';
import { ErrorBox } from '../../shared/ui';

export type ConflictSnapshot = {
  version: number;
  token: string;
  status: Report['status'];
  content: Content;
  authorId?: string;
};
const sections: { key: keyof Content; label: string }[] = [
  { key: 'indication', label: 'Clinical indication' },
  { key: 'technique', label: 'Technique' },
  { key: 'examination', label: 'Examination' },
  { key: 'findings', label: 'Findings' },
  { key: 'impression', label: 'Impression' },
  { key: 'language', label: 'Report language' },
];
export function ReportConflictReview({
  local,
  baseVersion,
  snapshot,
  currentToken,
  busy,
  error,
  onLoad,
  onUseSection,
  onKeep,
  onReplace,
}: {
  local: Content;
  baseVersion: number | null;
  snapshot: ConflictSnapshot | null;
  currentToken: string;
  busy: boolean;
  error: unknown;
  onLoad: () => void;
  onUseSection: (field: keyof Content, value: Content[keyof Content]) => void;
  onKeep: () => void;
  onReplace: () => void;
}) {
  const current = snapshot?.token === currentToken;
  const canMerge = !!snapshot && current && snapshot.status !== 'Signed' && !busy;
  return (
    <section className="conflict-review" aria-label="Report conflict comparison">
      <h3>Compare before saving another revision</h3>
      <p>
        Your unsaved text is retained. Load the current server revision, compare each section, and
        explicitly choose how to continue. Nothing is merged, saved or signed automatically.
      </p>
      <button type="button" disabled={busy} onClick={onLoad}>
        {busy ? 'Loading server revision...' : 'Reload server version'}
      </button>
      {!!error && <ErrorBox error={error} />}
      {snapshot && (
        <>
          <p>
            Server revision {snapshot.version} · {snapshot.status}
            {snapshot.authorId ? ' · Saved by ' + snapshot.authorId : ''}
          </p>
          {!current && <p role="status">The server context changed. Reload before resolving.</p>}
          {snapshot.status === 'Signed' && (
            <p role="status">
              The server report is signed. Your text cannot overwrite it. Copy any needed text
              before replacing the editor view; corrections require an addendum.
            </p>
          )}
          <div className="conflict-grid conflict-headings" aria-hidden="true">
            <strong>
              Your text{baseVersion === null ? '' : ' · Based on revision ' + baseVersion}
            </strong>
            <strong>Server revision {snapshot.version}</strong>
          </div>
          {sections.map(({ key, label }) => (
            <div className="conflict-section" key={key}>
              <div className="conflict-section-heading">
                <h4>{label}</h4>
                <span>{local[key] === snapshot.content[key] ? 'Same text' : 'Different text'}</span>
              </div>
              <div className="conflict-grid">
                <div>
                  <small>Your text</small>
                  <pre aria-label={'Your ' + label.toLowerCase()}>
                    {local[key] || 'Not recorded'}
                  </pre>
                </div>
                <div>
                  <small>Server text</small>
                  <pre aria-label={'Server ' + label.toLowerCase()}>
                    {snapshot.content[key] || 'Not recorded'}
                  </pre>
                </div>
              </div>
              <button
                type="button"
                className="desktop-action"
                disabled={!canMerge || local[key] === snapshot.content[key]}
                onClick={() => onUseSection(key, snapshot.content[key])}
              >
                Use server {label.toLowerCase()}
              </button>
            </div>
          ))}
          <div className="conflict-actions desktop-action">
            <button type="button" disabled={!canMerge} onClick={onKeep}>
              Continue with my reviewed text
            </button>
            <button type="button" disabled={busy || !current} onClick={onReplace}>
              Replace my unsaved text with server revision
            </button>
          </div>
          <p className="fine-print">
            Continuing retains the text currently in your editor and uses the loaded server token
            for your next explicit save. A further concurrent edit will require another comparison.
          </p>
        </>
      )}
    </section>
  );
}
