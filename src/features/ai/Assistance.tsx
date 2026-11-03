import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../shared/auth/Auth';
import { facilityPath, request } from '../../shared/api/client';
import type { Content, Order, Proposal, Report, Template } from '../../shared/api/types';
import { Badge, ErrorBox } from '../../shared/ui';
export function Assistance({
  order,
  report,
  dirty,
  blocked = false,
  content,
  onUpdated,
}: {
  order: Order;
  report: Report;
  dirty: boolean;
  blocked?: boolean;
  content: Content;
  onUpdated: () => Promise<void>;
}) {
  const { facilityId } = useAuth();
  const [original, setOriginal] = useState('');
  const [checked, setChecked] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [notice, setNotice] = useState('');
  const templates = useQuery({
    queryKey: [facilityId, 'templates'],
    queryFn: () => request<Template[]>(facilityPath(facilityId, 'templates')),
  });
  const command = useMutation({
    mutationFn: ({ suffix, body }: { suffix: string; body: unknown }) =>
      request<{ id: string } | Proposal>(
        facilityPath(facilityId, `reports/${report.id}/${suffix}`),
        'POST',
        body,
      ),
    onSuccess: async (result, variables) => {
      if (variables.suffix === 'ai-draft') {
        setProposal(result as Proposal);
        setNotice('Unverified proposal ready for your review.');
      } else {
        setProposal(null);
        await onUpdated();
        setNotice(
          variables.suffix === 'transcripts'
            ? 'Checked input saved. Prior proposals are stale.'
            : 'Your review decision was recorded.',
        );
      }
    },
  });
  const disabled = blocked || dirty || report.status === 'Signed' || command.isPending;
  return (
    <div className="assistance">
      <div className="ai-heading">
        <Sparkles size={21} />
        <div>
          <h3>Assistance, with your oversight.</h3>
          <p>The configured provider may be disabled. Manual reporting stays available.</p>
        </div>
      </div>
      <div className="info-box">
        Checked-text drafting only. No speech recognition, image interpretation, or autonomous
        diagnosis. No confidence score is supplied by this backend.
      </div>
      {blocked && (
        <p className="field-error">Resolve the report conflict before using assistance.</p>
      )}
      {dirty && <p className="field-error">Save your report edits before using assistance.</p>}
      <form
        className="desktop-action"
        onSubmit={(event) => {
          event.preventDefault();
          command.mutate({
            suffix: 'transcripts',
            body: {
              originalText: original,
              checkedText: checked,
              language: content.language,
              confirmedByRadiologist: confirmed,
            },
          });
        }}
      >
        <fieldset disabled={disabled}>
          <label>
            Original observations
            <textarea
              required
              maxLength={30000}
              value={original}
              onChange={(event) => setOriginal(event.target.value)}
            />
          </label>
          <label>
            Clinician-checked observations
            <textarea
              required
              maxLength={30000}
              value={checked}
              onChange={(event) => setChecked(event.target.value)}
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            I checked these observations against the original source.
          </label>
          <button disabled={!confirmed}>Save checked input</button>
        </fieldset>
      </form>
      <label>
        Published source template
        <select
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
          disabled={disabled}
        >
          <option value="">Choose a published template</option>
          {templates.data
            ?.filter(
              (t) =>
                t.published &&
                t.modality === order.modality &&
                t.bodyRegion === order.bodyRegion &&
                t.language === content.language,
            )
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.language} · v{t.version}
              </option>
            ))}
        </select>
      </label>
      {templates.error && <ErrorBox error={templates.error} />}
      <button
        className="primary desktop-action"
        disabled={disabled || !report.checkedTranscriptId || !templateId}
        onClick={() =>
          command.mutate({
            suffix: 'ai-draft',
            body: {
              expectedToken: report.concurrencyToken,
              transcriptId: report.checkedTranscriptId,
              templateId,
            },
          })
        }
      >
        <Sparkles size={16} />
        Request draft proposal
      </button>
      {command.error && <ErrorBox error={command.error} />}
      <p role="status">{notice}</p>
      {proposal && (
        <section className="proposal">
          <Badge tone="orange">Unverified AI proposal</Badge>
          <p className="proposal-findings">{proposal.findings}</p>
          <dl>
            <dt>Provider / model</dt>
            <dd>
              {proposal.provider} / {proposal.modelVersion}
            </dd>
            <dt>Prompt / schema</dt>
            <dd>
              {proposal.promptVersion} / {proposal.schemaVersion}
            </dd>
            <dt>Created</dt>
            <dd>{new Date(proposal.createdAt).toLocaleString()}</dd>
            <dt>Source references</dt>
            <dd>
              <code>{proposal.sourcesJson}</code>
            </dd>
          </dl>
          <p>
            Accepting creates an unsigned revision. Examination and impression remain
            clinician-authored.
          </p>
          <div className="actions desktop-action">
            <button
              className="primary"
              disabled={disabled || !content.examination.trim() || !content.impression.trim()}
              onClick={() =>
                command.mutate({
                  suffix: `proposals/${proposal.id}/review`,
                  body: {
                    expectedToken: report.concurrencyToken,
                    accept: true,
                    contentSchemaVersion: 2,
                    indication: content.indication || null,
                    technique: content.technique || null,
                    examination: content.examination,
                    impression: content.impression,
                  },
                })
              }
            >
              Accept into draft
            </button>
            <button
              disabled={disabled}
              onClick={() =>
                command.mutate({
                  suffix: `proposals/${proposal.id}/review`,
                  body: {
                    expectedToken: report.concurrencyToken,
                    accept: false,
                    examination: content.examination || 'Not accepted',
                    impression: content.impression || 'Not accepted',
                  },
                })
              }
            >
              Reject proposal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
