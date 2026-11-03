# RadIntel implementation status

Recorded 30 October 2026. Initial handoff source inspection was documentation-only. M05A and M05B are implemented; current verification is in the checkpoint and docs/13. Earlier M04 evidence remains historical.

## Milestone position

| Increment                                                    | Current status                                                                    | Remaining boundary                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Initial workflow and dedicated React UI                      | Implemented locally                                                               | Full pilot/clinical acceptance is not established                                          |
| A01 contracts / A02 mock parity                              | Implemented and previously locally verified                                       | Maintain snapshot/type drift and actual API parity                                         |
| M01 connected local development                              | Implemented and previously locally verified                                       | Application DB setup is manual; development auth is not institutional login                |
| M02 institutional login/release security                     | Pending / external configuration needed                                           | IdP/session architecture, reauthentication/MFA and production hosting                      |
| M03 PostgreSQL/API/browser verification and CI configuration | Implemented and previously locally verified                                       | Hosted CI and production deployment not verified                                           |
| M04 server search / patient context / current tokens         | Implemented and previously locally verified                                       | No acquisition-date model, ingestion tracking, readiness probe or indexed full-text search |
| M05 report schema / provenance / conflict comparison         | Implemented locally: M05A conflict comparison and M05B optional fields/provenance | Prepared application migration remains unapplied; final evidence below                     |
| M06/M07 diagnostic viewer                                    | M06A assessed; M06B transport and M06C synthetic rendering delivered              | M07 tools/layout/geometry/performance, vendor integration and clinical acceptance remain   |
| M08-M10 secure upload / extraction / review                  | Pending                                                                           | Storage/quarantine/job/provider/matching/provenance contracts                              |
| M11 localization/accessibility/release checks                | Partially implemented                                                             | Full language/terminology review and manual accessibility matrix                           |
| Phase 2 capabilities                                         | Mostly pending; foundations noted below                                           | References, comparisons, dictation, explanations, analytics, operations/delivery           |
| Phase 3 diagnostic AI                                        | Gated / not implemented                                                           | Explicit model/intended-use/governance/validation authorization                            |

## Capability inventory

B = sibling RadIntel-AI source; F = this frontend source. Paths refer to current working-tree files, including uncommitted/untracked files, not a published commit.

| Capability                                | Backend                                                          | Frontend                                                                              | Evidence / limitation                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Session/onboarding/memberships            | Implemented                                                      | Institution selection and membership administration; complete provisioning UX pending | B WorkflowController.cs / WorkflowService.cs; F shared/auth and administration                  |
| Patient registry/registration             | Implemented, scoped uniqueness                                   | Implemented, server search and pagination                                             | B WorkflowService.Search.cs; F patients/Patients.tsx and queries.ts                             |
| Order creation / worklist                 | Implemented                                                      | Implemented; full authorized-dataset filters and paginated patient picker             | F worklist/Worklist.tsx and CreateOrder.tsx                                                     |
| Current patient/order context             | Implemented, access-masked                                       | Implemented; direct context lookup and refresh                                        | B OrderContextResponse; F reports/StudyWorkspace.tsx                                            |
| Claim/check-in/acquisition/cancellation   | Implemented with roles/tokens                                    | Implemented role-aware actions                                                        | Existing domain transitions are authoritative                                                   |
| Equipment scheduling/rescheduling         | Implemented, overlap/resource concurrency                        | Equipment administration; complete React booking/calendar UX pending                  | Legacy backend UI includes scheduling; do not equate it with completed React scheduling         |
| Structured reporting                      | Implemented required sections plus optional indication/technique | Implemented explicit-save composer                                                    | M05B adds optional indication/technique; no referral inference                                  |
| Revisions / review / MFA signature        | Implemented, append-only/hash/idempotency                        | Implemented confirmation and locked signed view                                       | Legacy digest preserved; schema-2 hash includes sections and provenance                         |
| Addenda / signed text export              | Implemented                                                      | Implemented                                                                           | PDF, finalized recipient portal and delivery not implemented                                    |
| 409 recovery                              | Implemented optimistic guards                                    | Retains unsaved edits and explicitly reloads token/version                            | Explicit side-by-side comparison includes optional sections; provenance follows saved revisions |
| Templates/publication                     | Implemented versioned templates and source matching              | Implemented template administration/source selection                                  | Publication requires server permissions                                                         |
| Checked observations / Verbatim proposal  | Implemented checked text/provenance/stale-source guards          | Implemented explicit input confirmation and accept/reject                             | No speech recognizer or clinical generative model                                               |
| Published-template Q&A                    | Existing scoped Local/Azure-configurable infrastructure          | Clinical reference assistant UI not delivered                                         | No live cloud quality/authorization claim                                                       |
| PACS linkage / bounded DICOMweb           | Implemented identity verification and access checks              | Metadata/linking only, lazy-loaded                                                    | No diagnostic rendering/measurements; live PACS unverified                                      |
| Image availability / ingestion            | Unknown / NotTracked metadata only                               | Explicit limitations                                                                  | Link count is not a readiness signal                                                            |
| Audit / outbox                            | Append-only application guards and atomic signed-event intent    | Audit list and status counts                                                          | Dispatcher, delivery retry/acknowledgement and tamper-evident storage pending                   |
| Contracts                                 | Shared OpenAPI registration/export tool                          | Snapshot/generated types/drift scripts                                                | Nullable patient/report summary represented correctly                                           |
| Synthetic local setup                     | Explicit API-only initializer                                    | Eight-case in-memory demo; API mode uses DB cases                                     | Initializer creates three synthetic cases, no schema/signing                                    |
| Accessibility / responsiveness            | N/A                                                              | Labels, keyboard/dialog basics, axe, desktop editing/mobile read-only                 | Screen reader/zoom/browser matrix and full medical localization pending                         |
| Analytics / notifications / consultations | Basic counts only                                                | Basic counts only                                                                     | Dashboard page counts are labeled; durable analytics and dispatch workflows pending             |

## Source map

Backend paths are relative to RadIntel-AI:

- src/RadIntel.Api/WorkflowController.cs: legacy and additive search/context/report/admin routes.
- src/RadIntel.Api/ApiContracts.cs and ClientConfigurationController.cs: contract metadata and local capability response.
- src/RadIntel.Infrastructure/WorkflowService.cs and WorkflowService.Search.cs: authorized workflows/search/context.
- src/RadIntel.Infrastructure/RadIntelDbContext.cs and Migrations/: tenant relationships, history and prepared schema.
- src/RadIntel.Domain/Entities.cs: states, report content and signature digest.
- src/RadIntel.Integrations.Dicom/: archive adapter and transport/identity boundaries.
- tests/RadIntel.Tests/: ordinary HTTP/domain/model/search regressions.
- tests/RadIntel.PostgreSql.Tests/: real-provider search and claim/schedule/sign concurrency.
- tests/RadIntel.IntegrationSupport/ and tools/: controlled integration auth, disposable databases and schema export.
- scripts/Initialize-LocalDemo.ps1: opt-in synthetic setup.

Frontend paths:

- src/app/App.tsx and styles.css: routes/shell/navigation guard.
- src/features/: worklist, patients, reports, AI assistance, imaging and administration.
- src/shared/api/: request boundary, generated contract types and UI projections.
- src/shared/auth/: session and Development bridge; shared/i18n/: English/Albanian labels.
- src/test/mocks/: synthetic MSW transport; test/setup.ts: Node/JSDOM test compatibility only.
- e2e/: six synthetic Chromium scenarios; e2e-api/: four real API/PostgreSQL scenarios.
- scripts/run-integration.mjs: owned temporary PostgreSQL/API/browser orchestration.
- .github/workflows/frontend.yml: configured checks; actual hosted execution not established.

## Verification evidence

| Check                  | Last completed M04 result | Important scope                                                                                            |
| ---------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Frontend tests         | 29 passed                 | Auth/request/proposal/permission/picker regressions                                                        |
| Backend ordinary suite | 60 passed                 | Includes new search/masking/filter validation and refreshed link/schedule/report tokens                    |
| PostgreSQL suite       | 4 passed                  | Migrations/replay, race scenarios and provider-translated search beyond 100 patients                       |
| Demo browser           | 6 passed                  | Report lifecycle, dirty navigation, languages/mobile, axe, proposals, patient/order creation               |
| Real API browser       | 4 passed                  | Reporting/sign/export, two-editor 409 recovery, search across pages, retained patient selection beyond 100 |
| Build/type/lint/format | Passed                    | Recorded during completed M04 work                                                                         |
| Contract drift         | Passed                    | Both backend snapshot and generated TypeScript checks                                                      |

Current handoff checks: source inspection; both browser .last-run.json files report passed/no failures; six/four declared scenarios; all eight original hashes match; backend Git inventory captured; frontend has no Git repository.

No new tests or audits were run in the initial documentation-only handoff. M05A subsequently ran the tests recorded in docs/12; no fresh dependency audit is claimed. Browser last-run JSON is limited corroboration, not a complete immutable test report. Previous console results/conversation and docs/11 provide the detailed local verification record. No hosted CI, production IdP, live PACS, clinical model or real-patient validation is asserted.

## Priorities and acceptance gaps

1. **P0 release blockers:** institution authentication/HTTPS/no-store hosting, recent MFA, production role/tenant isolation validation, database credential/schema ownership, audit/retention/security and clinical acceptance. These do not block synthetic local development.
2. **P1 next:** review M05B, prepare the intended local database deliberately, and choose the next bounded viewer/identity track. M05A/M05B are implemented; see current validation below.
3. **P1 subsequent tracks:** diagnostic viewer proof/acceptance and secure document intake/extraction/review; no fake operational or clinical readiness states.
4. **P1/P2 operations:** React scheduling/admin journeys, saved views, ingestion lifecycle, dispatch/consultation/notifications, signed PDF and delivery worker.
5. **P2 capabilities:** approved-reference assistant, prior/current comparison, speech-to-checked-text, patient explanations and durable aggregate analytics.
6. **P3 gated:** candidate findings, segmentation and AI triage, subject to the assessment's separate clinical/model authorization.

Backend still targets .NET 9 via its own pin; runtime/dependency support and security review are part of release planning. Do not import another project's SDK/dependency changes.

## Git preservation snapshot

Backend branch: master. HEAD: 52a42eddefc7b78c0b879942d817856a462dbeae. No staged changes were introduced by this handoff. The frontend has no .git directory/repository.

The following is the backend short-status inventory captured immediately before writing these handoff documents. It includes earlier/user work and must not be discarded. This task additionally creates docs/context in the frontend, a backend pointer document and README links.

```text
## master...origin/master
 M README.md
 M docs/05_Framework_Alignment.md
 M docs/IMPLEMENTATION.md
 M docs/originals/README.md
 M src/RadIntel.Api/ImagingController.cs
 M src/RadIntel.Api/Program.cs
 M src/RadIntel.Api/WorkflowController.cs
 M src/RadIntel.Infrastructure/WorkflowService.cs
 M tests/RadIntel.Tests/ImagingTests.cs
 M tests/RadIntel.Tests/RadIntel.Tests.csproj
 M tests/RadIntel.Tests/WorkflowTests.cs
?? .github/
?? docs/06_Seven_Document_Alignment.md
?? docs/07_M04_Server_Search_and_Order_Context.md
?? docs/originals/2026-10-seven-documents/
?? scripts/Initialize-LocalDemo.ps1
?? src/RadIntel.Api/ApiContracts.cs
?? src/RadIntel.Api/ClientConfigurationController.cs
?? src/RadIntel.Application/WorkflowResponses.cs
?? src/RadIntel.Contracts/SearchRequests.cs
?? src/RadIntel.Infrastructure/WorkflowService.Search.cs
?? tests/RadIntel.IntegrationSupport/
?? tests/RadIntel.PostgreSql.Tests/
?? tests/RadIntel.Tests/DevelopmentContractTests.cs
?? tests/RadIntel.Tests/DisposableDatabaseSafetyTests.cs
?? tests/RadIntel.Tests/SearchTests.cs
?? tools/
```

## Historical M05B verification checkpoint

<!-- M05_CHECKPOINT_START -->

31 October 2026: **M05B implemented and locally verified**. Passed: 74 ordinary backend tests, 5 PostgreSQL tests, 37 frontend tests, 6 demo Chromium scenarios and 7 actual API/PostgreSQL Chromium scenarios. Build, lint and backend OpenAPI/generated TypeScript drift checks passed. Final repository-wide formatting check passed. All 8 original source hashes match. Migration 20261031120234_VersionedReportContent / SQL 003 is prepared; application databases remain unmigrated. No commit, push, branch switch or Git-ref change. Backend remains master at 52a42eddefc7b78c0b879942d817856a462dbeae; frontend has no Git repository. See [M05B record](../13_M05B_Versioned_Content_and_Provenance.md).

<!-- M05_CHECKPOINT_END -->

## Current M05A capability and evidence

- Explicit local/server comparison, section copy, reviewed-text continuation and deliberate whole-editor replacement are implemented.
- Failed fetches preserve local text; stale saves/submit/sign/assistance stay blocked; a newer race requires another comparison.
- Signed server versions cannot be overwritten. Existing report content/digest/schema/API is unchanged.
- Source: features/reports/ReportConflictReview.tsx, StudyWorkspace.tsx, features/ai/Assistance.tsx; backend SignatureCompatibilityTests.cs.
- Fresh local results: 34 frontend, 64 backend, 6 demo browser and 6 actual API/PostgreSQL browser cases passed. Build and lint passed. Dedicated PostgreSQL concurrency suite was not rerun; its 4-pass M04 record is historical.
- This section records historical M05A scope. M05B now implements optional fields, immutable provenance, versioned digests and a prepared additive migration; see docs/13 and the current checkpoint.

M05A adds the untracked backend file tests/RadIntel.Tests/SignatureCompatibilityTests.cs after the historical Git snapshot above. No backend production/schema files or Git refs were changed by this increment. Final formatting/type-generation/backend OpenAPI checks passed.

## M05B source inventory and limits

Backend: Requests.cs, partial ReportVersion in VersionedReportContent.cs, WorkflowService.Revisions.cs, workflow signing/read/export changes, EF mapping/snapshot, migration 20261031120234_VersionedReportContent and deploy/sql/003_VersionedReportContent.sql. New ordinary tests: VersionedReportTests.cs; new real-PostgreSQL test: VersionedReportMigrationTests.cs.

Frontend: regenerated OpenAPI/types; editableContent projection; optional editor/history/conflict/sign sections; RevisionProvenance; checked-proposal retention; matching demo revision behavior; new projection and API browser regressions. This is application-level tenant/role enforcement and immutable workflow history, not PostgreSQL RLS or administrator-proof cryptography.

Backend remains master at 52a42eddefc7b78c0b879942d817856a462dbeae with unstaged source, schema, test and documentation work from M04/M05 and earlier tasks. No Git refs or staging changes were made. The inventory above is explicitly historical; the source inventory here identifies the M05B additions. Frontend remains outside Git. Application schemas and the pre-existing PostgreSQL service were untouched.

## Progress estimate and immediate direction (31 October 2026)

Approximately **45-55% of the combined backend/frontend MVP** is complete as a qualitative engineering estimate. No weighted work breakdown or effort baseline exists; this is not a measured percentage, release readiness assessment or commitment. Phase 2/3 capabilities are excluded. Delivered scope includes the workflow/UI foundation, M04 search/context, M05A conflicts and M05B optional sections/provenance/versioned signatures. Major remaining scope: M02 institutional identity/security, M06/M07 diagnostic viewer, M08-M10 secure document processing and M11 release acceptance.

Immediate sequence: review M05B with synthetic local data after deliberate SQL 003 preparation; next recommended engineering track is M06 integration proof then M07. Resolve institution IdP/session inputs alongside this and complete M02 before real-data release. No new milestone implementation or application migration was performed for this documentation update. Existing test evidence remains the latest M05B run; no application tests were rerun for these prose edits.

## Original-package alignment clarification (31 October 2026)

Read [current seven-document alignment](../14_Original_Package_Alignment_Status.md) before claiming package compliance. Core architecture and clinician-controlled reporting align, but complete requirements/acceptance are unfinished. Original document 01 explicitly requests autosave; it remains pending a separate draft contract, not silently satisfied by explicit revision saves. Diagnostic viewer, institutional identity, async AI jobs, complete operational flows and manual/clinical/security acceptance remain narrower or missing. v2 adds extraction and other scope; M05B provenance does not implement extraction provenance. The qualitative MVP estimate is not a document-compliance percentage.

This clarification reread all seven PDFs and verified all eight original source hashes. It changed documentation only; latest M05B test evidence is retained, with no new application test execution or application migration. Preserve compatibility adaptations and the roadmap; no new architecture/provider choice or implementation authorization is inferred.

## Historical M06A assessment checkpoint (31 October 2026)

M06A assessment is complete; read [the scoped viewer assessment and implementation plan](../15_M06_Viewer_Assessment_and_Integration_Plan.md). Existing PACS security/linkage is reusable, but current routes are not a complete stock-viewer DICOMweb root and the frontend client does not decode binary frames. Required proof work includes exact child UID validation, multipart/transfer-syntax handling, authenticated binary transport, cache/lifecycle cleanup and an isolated custom data source.

Preferred candidate for proof is self-hosted OHIF behind a scoped product adapter; embedded Cornerstone is a fallback. Neither is installed, pinned or accepted. Next bounded batch is M06B scoped transport/identity proof using synthetic HTTP fixtures, followed by M06C pinned OHIF rendering proof; M07 tools/clinical acceptance follows. No rendering or diagnostic readiness is delivered by this assessment. M02 remains a real-data prerequisite, and SQL 003 is still unapplied to application databases.

This increment changes documentation only: source and original viewer requirements were inspected and official viewer references checked. No application tests, live PACS/viewer runtime, migrations, dependency changes or Git-ref operations occurred. Latest passing application tests remain the M05B record. Targeted documentation formatting and relative-link checks passed; all eight original source hashes still match. Continue maintaining all four handoff files after every coherent change.

## Historical M06B verification checkpoint (31 October 2026)

**M06B scoped transport/identity proof is implemented and locally verified.** Read [M06B scoped transport](../16_M06B_Scoped_Viewer_Transport.md) before continuing. Backend: additive read-only viewer-context/viewer-frames POSTs, exact stored study/order and child UID validation, bounded single-part raw-16 validation, stale metadata hash rejection, existing patient/membership/assignment rechecks and audit. Proof access requires Development, loopback and Imaging:EnableViewerProof=true; default disabled, never enabled in production.

Frontend: generated contracts, authenticated bounded binary transport, session/facility invalidation and cancellation, transient validated context, two active reads/32 queued requests, disposal and stale reload guards. This module is not wired to a renderer: UI remains metadata-only, no OHIF/Cornerstone dependency or new diagnostic claim. No database migration or dependency version change.

Final results: **89 ordinary backend, 5 PostgreSQL, 49 frontend, 6 demo Chromium and 7 actual API/PostgreSQL Chromium cases passed**. Build/lint and backend OpenAPI/generated TypeScript drift checks passed. Final repository-wide formatting passed; 31 relative links resolve and all 8 original source hashes match. Git diff whitespace check passed; master/HEAD and staging remain unchanged. Historical M05B record received formatting only. The backend viewer suite includes real loopback archive HTTP and ephemeral SQLite API access tests; the real PostgreSQL browser suite checks existing reporting workflows, not diagnostic rendering. No hosted CI/live PACS/clinical acceptance is claimed.

An early API browser run had 6 passes and a login-screen failure while frontend files were edited; stable-source rerun passed all 7 without weakening tests. A shared NuGet asset failure was resolved by restoring unchanged pinned dependencies; final backend run passed all 89. See docs/16 for chronological fixture/stream fixes.

Next is M06C: pin/build self-hosted OHIF and prove the scoped data source/transport and image rendering with synthetic data. M07 tool/geometry/performance/clinical acceptance and M02 institutional identity remain separate. Preserve original document autosave/operational gaps. Application SQL 003 remains prepared but unapplied; no commits, staging or branch changes. Keep all four handoff files current after each coherent change. Batch history and limitations live in docs/16.

## M06C current checkpoint (2 November 2026)

**M06C pinned synthetic rendering proof is implemented and locally verified.** **OHIF 3.11.1**, source commit 3c2b027e8bc7a238ffe46ecb5f57c6c913069c3e, published SHA-512 and tarball SHA-256 are pinned in viewer/ohif.lock.json. The rejected 3.11.0 candidate had an upstream DICOM JSON initialization defect; 3.11.1 supplies the upstream guard and no vendor bundle is patched. Read [M06C implementation, preview and limits](../17_M06C_Pinned_Viewer_Proof.md).

The proof uses a separate exact-origin loopback static host, iframe and checked MessageChannel; product credentials stay in the parent. Only listed-study M06B context/frame operations are exposed. The child maps checked metadata/raw pixels to the bundled DICOM JSON source and minimal in-memory Part 10; independent dicom-parser checks preserve exact pixels/identity/geometry. No invented patient metadata, external PACS URLs, public data sources, uploads or offline clinical cache. Storage method/property writes are blocked. Closing/logout aborts transport, closes channels and removes the child frame/workers.

Opt in only in loopback Vite Development with VITE_ENABLE_VIEWER_PROOF=true; backend real-API proof still requires Imaging\_\_EnableViewerProof=true and Development/loopback. Default UI stays metadata-only. Demo synthetic CT/DX patterns are available without a database; actual API proof uses an owned archive and disposable PostgreSQL. M06C does not change backend application source/schema or report/signing semantics.

Passing final viewer checks: **3 actual API/PostgreSQL viewer cases** (CT, DX, logout during delayed pixels), including child credential absence, zero local/session storage/service-workers/cache persistence, report preservation, frame detachment and worker termination. **54 frontend tests, production build/lint and 6 standard demo browser cases passed**. The unchanged **89 backend and 5 PostgreSQL tests passed**, and the final serialized **7-case ordinary API browser rerun passed**. The first full run had one saved-report notice check time out during refresh; explicit save-response synchronization fixed the test without increasing UI timeouts or weakening assertions. Final build/lint, repository-wide formatting and generated-contract/backend OpenAPI drift checks passed. All 42 relative links resolve; all 8 original source hashes, pinned tarball SHA-512/SHA-256 and 240 extracted asset hashes match. Upstream release tag resolves to the recorded source commit. Git whitespace check passed, master/HEAD and staging unchanged. Final verification recorded 2 November 2026, Europe/Budapest.

Next is M07 tools/layout/geometry/measurement/performance/accessibility and clinical acceptance. M02 institutional identity/production hosting remains a release prerequisite. Autosave, operational workflows and M08-M10 extraction remain separate gaps. This is a bounded synthetic proof, not a clinically accepted diagnostic viewer or measured completion score. SQL 003 remains unapplied to application databases. No commits/push/staging/branch changes; preserve master/HEAD and existing work.

M06C new source inventory: features/imaging/ViewerProof.tsx and viewerProofConfig.ts; guarded ImagingPanel integration; viewer/ pinned artifact/config/bootstrap/encoder/fixture/notice files; prepare/serve/archive scripts; viewer integration runner mode and browser cases; independent encoder unit cases; explicit test-only dicom-parser/Node-types dependencies. Existing backend application source is unchanged.
