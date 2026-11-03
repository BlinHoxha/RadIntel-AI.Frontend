# M05B: versioned optional sections and immutable provenance

31 October 2026. Status: implemented and locally verified; repository-wide formatting passed.

## Contract decisions

Indication and technique are optional, as approved by the owner. Each is limited to 4000 characters; blank/whitespace saves as null. They are never inferred from order referral or AI text. Existing required examination/findings/impression/language remain unchanged.

Save/review requests add an explicit contentSchemaVersion (default 1 for existing clients) and nullable indication/technique. The new React editor submits schema 2. Schema-1 requests cannot contain new sections or downgrade a report whose latest revision is schema 2. Old v1 clients/flows remain usable for v1 reports. No historical revision or signature is rewritten.

Each new schema-2 revision contains immutable server-created section attribution: manual submission/edit, retained from previous revision, not recorded, or accepted checked-text proposal/transcript. Revision provenance records actor, prior revision ID and, where applicable, scoped proposal/transcript/template IDs plus provider/model/prompt/schema metadata. Clients cannot assert these origins. Retention/edit origins link to earlier revision history; they do not claim that manually submitted text has a verified external source.

Legacy signing uses exactly the existing four-field UTF-16-length-prefixed/UTF-8 SHA-256 algorithm. Schema 2 uses an explicit radintel-report-content-v2 domain prefix, fixed section order, length-prefixed values (null distinct from empty), and the stored provenance JSON. Signing/export dispatch on the persisted revision schema. Unknown schemas fail closed. Optional-section/provenance changes alter the v2 digest.

The additive migration defaults existing rows to schema 1 and adds nullable fields/provenance. Rollback must refuse to discard schema-2 content. Startup still does not migrate. Only new disposable test databases are migrated during verification; applying schema to an application database remains a separate administrative action.

## In-progress checkpoints

- Batch 1: compatibility/attribution design recorded before source changes. Backend implementation and verification pending.

## Scope implemented

Backend domain/contracts/workflow, additive EF migration and offline SQL, legacy/new digest and tenant/provenance regressions, generated API/types, editor/history/conflict/export and demo parity are implemented. No autosave, diagnostic AI, document extraction or clinical provider integration is introduced. Checkpoints below are chronological, not outstanding scope.

- Batch 2: backend code builds (0 warnings/errors). Migration and behavioral verification pending.

- Batch 3: migration/snapshot and rollback guard prepared; backend behavior tests and offline SQL/OpenAPI generation pending.

- Batch 4: editor/history/conflict optional sections and provenance UI implemented; 73/74 backend cases pass, new lineage failure under investigation. No completed-verification claim yet.

- Batch 5: stale-token regression fixture corrected using returned report; frontend and demo v2 parity implemented. Build/tests pending.

- Batch 6: PostgreSQL migration/replay/rollback test, UI projection tests and optional-section browser coverage added; full validation pending.

- Batch 7: export now inserts optional headers structurally, preserving literal section-like text inside clinical fields. Browser history assertions scoped to revision, correcting strict locator ambiguity. Full rerun pending.

- Batch 8: 74 ordinary backend, 5 PostgreSQL and 37 frontend tests pass. The seventh API browser test read data before the second save completed; corrected by awaiting its POST response. Browser rerun and final formatting pending. Build/lint/generated types passed.

## Source and operational contract

Backend: Requests.cs adds optional request properties with schema-1 defaults; VersionedReportContent.cs adds schema/optional fields, computed provenance and digest dispatch; WorkflowService.Revisions.cs creates server-owned lineage. WorkflowService signing and signed reads and WorkflowController signed export use revision digests. EF mapping/snapshot and migration 20261031120234_VersionedReportContent add columns only. SQL 003 is an idempotent forward migration after PacsStudyLinks. No content, signature or clinical seed rewrite occurs.

Frontend: editableContent selects only editable fields; server actor/IDs/provenance never enter form payloads. RevisionProvenance distinguishes legacy origins and unsaved edits. Optional sections participate in history, conflict comparison, checked-proposal acceptance, sign confirmation, mobile read-only review and demo export. Stored provenance describes saved revisions and never live keystrokes. Existing conflict/membership/MFA/signed-version guards remain in force.

Deploy database/backend/client together: back up the intended development database, apply prepared SQL 001 then 002 then 003 where pending, start the API and check readiness, then connect the updated client. This session did not apply these scripts to an application database. Do not downgrade migration after schema-2 saves: the EF Down guard deliberately refuses data loss.

## Validation and limits

- Ordinary backend: 74 passed, including pinned legacy hashes and optional limits/schema/lineage/source/tenant/tamper regressions.
- Dedicated PostgreSQL 17: 5 passed, including existing concurrency/signing/outbox cases and legacy signed export preservation across down/up/replay, v2 signing/export, literal section-like text preservation, refused destructive rollback and foreign-tenant denial.
- Frontend: 37 passed; lint, production build and generated TypeScript/backend OpenAPI comparison passed.
- Demo Chromium: 6 passed including axe and mobile read-only checks. API Chromium: 7 passed against the actual API and a newly migrated disposable PostgreSQL database. The browser-only rerun passed and cleaned up its owned database/cluster.
- All eight preserved source-document hashes match. Hosted CI, live IdP/PACS and real patient/clinical acceptance were not tested.

Attribution is application-level section lineage, not extracted-document citation, byte-range traceability or proof of an external manual source. Legacy origins are unknown and are not backfilled. Integrity compares stored hashes; it does not prevent a privileged database administrator from rewriting content and signatures together, and it is not a PKI digital-signature service. PostgreSQL tenant RLS is not introduced. Actual institutional login/MFA/session security remains M02.

- Final batch: all 7 API browser scenarios pass after scoped-history and save-response synchronization fixes. No production code changed after the 74 ordinary / 5 PostgreSQL test pass. Final repository-wide formatting check passed.
