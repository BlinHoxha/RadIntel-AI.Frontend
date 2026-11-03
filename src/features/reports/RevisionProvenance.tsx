import type { Version } from '../../shared/api/types';

const origins: Record<string, string> = {
  ManualSubmission: 'Manually submitted',
  ManualEdit: 'Manually edited from the preceding revision',
  RetainedFromPreviousRevision: 'Retained from the preceding revision',
  AcceptedCheckedTextProposal: 'Accepted checked-text proposal',
  CheckedTranscript: 'Confirmed checked transcript',
  NotRecorded: 'Not recorded',
};
const names: Record<string, string> = {
  examination: 'Examination',
  findings: 'Findings',
  impression: 'Impression',
  language: 'Report language',
  indication: 'Clinical indication',
  technique: 'Technique',
};
export function RevisionProvenance({
  version,
  versions,
  dirty = false,
}: {
  version?: Version;
  versions: Version[];
  dirty?: boolean;
}) {
  if (!version) return null;
  const provenance = version.provenance;
  return (
    <section className="revision-provenance" aria-label="Saved revision provenance">
      <h4>Saved revision provenance</h4>
      <p>
        Revision {version.number} - Content schema {version.contentSchemaVersion ?? 1}
      </p>
      {dirty && (
        <p>Unsaved edits have not been attributed. Sources below describe the saved revision.</p>
      )}
      {!provenance ? (
        <p>Legacy revision: section origins were not recorded.</p>
      ) : (
        <>
          <p>
            Submitted by {provenance.actorId}.{' '}
            {provenance.method === 'AcceptedProposal'
              ? 'Checked-text proposal explicitly accepted by the clinician.'
              : 'Manual save.'}
          </p>
          <ul>
            {provenance.sections.map((section) => {
              const source = versions.find((v) => v.id === section.sourceVersionId);
              return (
                <li key={section.section}>
                  <strong>{names[section.section] || section.section}:</strong>{' '}
                  {origins[section.origin] || section.origin}
                  {source ? ' (revision ' + source.number + ')' : ''}
                </li>
              );
            })}
          </ul>
          {provenance.proposalId && (
            <dl>
              <dt>Proposal</dt>
              <dd>
                <code>{provenance.proposalId}</code>
              </dd>
              <dt>Checked transcript</dt>
              <dd>
                <code>{provenance.transcriptId}</code>
              </dd>
              <dt>Template</dt>
              <dd>
                <code>{provenance.templateId}</code>
              </dd>
              <dt>Provider / model</dt>
              <dd>
                {provenance.provider} / {provenance.modelVersion}
              </dd>
              <dt>Prompt / proposal schema</dt>
              <dd>
                {provenance.promptVersion} / {provenance.proposalSchemaVersion}
              </dd>
            </dl>
          )}
        </>
      )}
    </section>
  );
}
