# Fresh-session prompt: continue RadIntel AI

Copy the prompt below into a fresh Codex conversation. This prompt establishes context and asks for a bounded proposal; it does not authorize all roadmap items.

---

We are continuing the radiology project, RadIntel AI.

Use only:

- C:\Users\blinh\source\repos\RadIntel-AI (backend).
- C:\Users\blinh\source\repos\RadIntel-AI.Frontend (React frontend).
- Read sibling Framework/AI-Framework only where needed for actual product dependencies.

Read any applicable AGENTS.md, both READMEs, frontend docs/context/SESSION_HANDOFF.md, IMPLEMENTATION_STATUS.md and ARCHITECTURE_DECISIONS.md. Then read docs/09_V2_Gap_Assessment_and_Implementation_Plan.md, docs/10_Foundation_Implementation_and_Local_Run.md, docs/11_M04_Server_Search_and_Order_Context.md and the relevant backend implementation/imaging records.

This is not TaskMetric. Do not transfer Forge identity, M1/M2 meanings, PostgreSQL roles/databases, test counts or SDK choices from that project. Do not edit or revert TaskMetric during radiology work.

Last inspected backend branch was master at 52a42eddefc7b78c0b879942d817856a462dbeae with substantial uncommitted/untracked work. The dedicated frontend was not a Git repository. Inspect actual state first and preserve every existing change. Do not commit, push, merge, initialize Git, switch branches, deploy or apply application schema without an appropriate explicit instruction.

The workflow/API and React UI already support patient/order management, claim/transition actions, manual reports, explicit revisions/review/signing, addenda/signed-text export, checked-text Verbatim proposals, templates, metadata-only PACS linkage, administration and audit. A01/A02/M01/M03 foundation and M04 search/context/token refresh are complete locally.

M04 uses server-wide POST searches, paged patient selection, current order context, masked patient details until claim for radiologist-only unassigned acquired cases, and refreshed command tokens. Preserve dirty editor contents after 409. Image availability is Unknown; processing is NotTracked. Dates are UTC order-created bounds, not verified study dates.

Historical M04 results were 29 frontend tests, 60 backend tests, 4 PostgreSQL tests, 6 demo browser scenarios and 4 real API browser scenarios passing, plus build/lint/format/type/contract checks. The initial documentation handoff did not rerun them; M05A has the fresh results recorded below. Both retained browser last-run files said passed and all eight original source hashes matched. Do not call that hosted CI, live PACS/IdP or clinical acceptance.

M05A conflict review and M05B optional reporting sections, immutable revision provenance and versioned signing are implemented. Read docs/12 and docs/13 plus current checkpoint results. Do not reimplement them or ask again whether indication/technique are optional. They are optional, max4000, blank-to-null. New React saves schema2; old clients default schema1 and cannot downgrade schema2 reports. Historical signatures use the unchanged legacy digest; v2 covers all sections and exact persisted provenance. Clients cannot assert source origins. Preserve explicit conflict recovery, saved-version signing, MFA checks and request-key replay. Autosave remains out of scope.

The additive migration 20261031120234_VersionedReportContent and deploy/sql/003_VersionedReportContent.sql are prepared. They were exercised only on disposable databases. Do not apply them to an application database without the corresponding instruction. Review backups/target and apply 001/002/003 as appropriate when authorized; startup does not migrate. Rollback refuses schema2 data loss.

M02 institution OIDC/PKCE or BFF remains a real-data release prerequisite. Viewer M06/M07 and document intake/extraction M08-M10 follow their proof, storage/provider and clinical gates. No Phase 3 diagnostic AI is authorized.

For local testing, use the current radiology SDK pin and npm.cmd/npx.cmd. Demo mode needs no DB. Connected mode needs deliberate local DB preparation and Development opt-ins; tokens/secrets stay outside Git and public VITE variables. The integration runner owns temporary loopback PostgreSQL databases; never point it at an application database or change the pre-existing PostgreSQL service. Preserve signing-policy settings and original PDFs/v2 source documents.

Begin by summarizing actual repository state and verified M06C scope. Read docs/15, docs/16 and docs/17; do not repeat assessment/transport/rendering proof or retry the rejected 3.11.0 artifact. Next propose a bounded M07 tools/layout/geometry/acceptance increment, keeping M02 identity/hosting and original-package gaps explicit. Institutional identity still needs IdP/session inputs. Do not change report semantics or implement another roadmap track without appropriate authorization. Update the handoff with verified results after any later authorized increment.

## Historical M05B verification checkpoint

<!-- M05_CHECKPOINT_START -->

31 October 2026: **M05B implemented and locally verified**. Passed: 74 ordinary backend tests, 5 PostgreSQL tests, 37 frontend tests, 6 demo Chromium scenarios and 7 actual API/PostgreSQL Chromium scenarios. Build, lint and backend OpenAPI/generated TypeScript drift checks passed. Final repository-wide formatting check passed. All 8 original source hashes match. Migration 20261031120234_VersionedReportContent / SQL 003 is prepared; application databases remain unmigrated. No commit, push, branch switch or Git-ref change. Backend remains master at 52a42eddefc7b78c0b879942d817856a462dbeae; frontend has no Git repository. See [M05B record](../13_M05B_Versioned_Content_and_Provenance.md).

<!-- M05_CHECKPOINT_END -->

After each coherent change, update all four handoff documents and the implementation record with current source scope, pending work and actual pass/fail/not-run evidence. Read docs/12_M05_Conflict_Review_and_Signature_Compatibility.md before continuing. M05B reran the PostgreSQL regressions plus migration compatibility coverage; use the current checkpoint rather than older counts.

## Latest owner steering (31 October 2026)

Keep all four context documents current after every coherent change, including decisions and roadmap updates, so continuation never depends on this chat. M05B is complete locally; do not follow any older plan to implement it again. Review the local synthetic workflow after deliberately preparing SQL 003 when authorized, then propose a bounded M06 viewer assessment/integration proof followed by M07. M02 institution IdP/session inputs remain unresolved and authentication/security must be completed before real-data release. M08-M10 intake/extraction and M11 acceptance remain outstanding.

The owner was given a qualitative estimate of 45-55% completion for the combined backend/frontend MVP, excluding the broader Phase 2/3 roadmap. This is not a measured metric or clinical readiness score; reassess against current scope. Latest validation remains the recorded M05B results. This continuity update changed documentation only, with no new application tests, application migrations or Git operations.

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

For M06C, use createViewerTransport and the existing private authenticated binary path; preserve two-active-read/32-queued bounds and context disposal. Configure Imaging\_\_EnableViewerProof=true only on the synthetic loopback Development API. Do not enable the proof for production or real patient data. The current ImagingPanel remains metadata-only: no rendering engine is installed. Pin and document exact viewer build/dependencies/licenses, prove its scoped data source and renderer/worker/GPU teardown, and keep diagnostic claims unavailable until M07 acceptance.

## M06C current checkpoint (2 November 2026)

**M06C pinned synthetic rendering proof is implemented and locally verified.** **OHIF 3.11.1**, source commit 3c2b027e8bc7a238ffe46ecb5f57c6c913069c3e, published SHA-512 and tarball SHA-256 are pinned in viewer/ohif.lock.json. The rejected 3.11.0 candidate had an upstream DICOM JSON initialization defect; 3.11.1 supplies the upstream guard and no vendor bundle is patched. Read [M06C implementation, preview and limits](../17_M06C_Pinned_Viewer_Proof.md).

The proof uses a separate exact-origin loopback static host, iframe and checked MessageChannel; product credentials stay in the parent. Only listed-study M06B context/frame operations are exposed. The child maps checked metadata/raw pixels to the bundled DICOM JSON source and minimal in-memory Part 10; independent dicom-parser checks preserve exact pixels/identity/geometry. No invented patient metadata, external PACS URLs, public data sources, uploads or offline clinical cache. Storage method/property writes are blocked. Closing/logout aborts transport, closes channels and removes the child frame/workers.

Opt in only in loopback Vite Development with VITE_ENABLE_VIEWER_PROOF=true; backend real-API proof still requires Imaging\_\_EnableViewerProof=true and Development/loopback. Default UI stays metadata-only. Demo synthetic CT/DX patterns are available without a database; actual API proof uses an owned archive and disposable PostgreSQL. M06C does not change backend application source/schema or report/signing semantics.

Passing final viewer checks: **3 actual API/PostgreSQL viewer cases** (CT, DX, logout during delayed pixels), including child credential absence, zero local/session storage/service-workers/cache persistence, report preservation, frame detachment and worker termination. **54 frontend tests, production build/lint and 6 standard demo browser cases passed**. The unchanged **89 backend and 5 PostgreSQL tests passed**, and the final serialized **7-case ordinary API browser rerun passed**. The first full run had one saved-report notice check time out during refresh; explicit save-response synchronization fixed the test without increasing UI timeouts or weakening assertions. Final build/lint, repository-wide formatting and generated-contract/backend OpenAPI drift checks passed. All 42 relative links resolve; all 8 original source hashes, pinned tarball SHA-512/SHA-256 and 240 extracted asset hashes match. Upstream release tag resolves to the recorded source commit. Git whitespace check passed, master/HEAD and staging unchanged. Final verification recorded 2 November 2026, Europe/Budapest.

Next is M07 tools/layout/geometry/measurement/performance/accessibility and clinical acceptance. M02 institutional identity/production hosting remains a release prerequisite. Autosave, operational workflows and M08-M10 extraction remain separate gaps. This is a bounded synthetic proof, not a clinically accepted diagnostic viewer or measured completion score. SQL 003 remains unapplied to application databases. No commits/push/staging/branch changes; preserve master/HEAD and existing work.

For a visual review, stop the previous frontend dev server yourself if reusing port 5173; run npm.cmd run viewer:prepare, then npm.cmd run viewer:serve in one terminal and the opt-in demo UI on exact http://127.0.0.1:5173 in another. See README/docs17. Actual proof command is npm.cmd run test:integration:viewer; it owns synthetic archive/API/viewer/test database cleanup. Do not point it at an application DB or enable synthetic proof for clinical use. Pin is 3.11.1, not 3.11.0. New source/header notices and resolved dependency/security review must be preserved for later release work.

Latest complete checks: 89 backend, 5 PostgreSQL, 54 frontend, 6 standard demo browsers, 7 ordinary real API browsers and 3 actual API viewer browsers. Backend application source/schema was unchanged in M06C; new test-only dev dependencies are dicom-parser@1.8.21 and @types/node@22.13.10. Next M07 must assess the exposed upstream tools, panel layout, source ordering/geometry/units, browser/GPU/accessibility and clinical acceptance before any diagnostic claim. Preserve the proof's default-off gates and pin/notice limitations.
