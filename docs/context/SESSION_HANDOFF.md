# RadIntel AI session handoff

Updated 12 November 2026, Europe/Budapest. Covers the current backend and React frontend through M06C synthetic rendering proof, the integrated dependency refresh and the M07A acceptance plan. Current results and limits are recorded below; historical counts remain dated.

## Scope and current position

- Backend: C:\Users\blinh\source\repos\RadIntel-AI.
- Frontend: C:\Users\blinh\source\repos\RadIntel-AI.Frontend.
- Shared dependencies: sibling Framework and AI-Framework checkouts; their reference hosts are not the product.
- Latest source increment: **M06C pinned OHIF synthetic rendering proof**, followed by integrated RI-DEPS-001 dependency upgrades. [M07A acceptance planning](../18_M07_Viewer_Acceptance_Plan.md) is the current documentation increment.
- M06A assessment, M06B transport and M06C bounded rendering proof are delivered; next is M07 acceptance/tools. Local M05B application review and M02 identity inputs remain outstanding.
- Release dependency still open: **M02 institutional authentication and deployment security**.

The product is a locally executable radiology workflow foundation, not a clinically approved deployment. Manual clinician-authored reporting is implemented. Diagnostic image rendering, automated image diagnosis and secure document extraction are not implemented.

TaskMetric requests were included accidentally in this conversation. TaskMetric source edits, security models, database names, test totals and milestone meanings do not apply to RadIntel. Do not modify or revert TaskMetric while continuing radiology work.

## Read order

1. This handoff and [implementation status](IMPLEMENTATION_STATUS.md).
2. [Architectural decisions and invariants](ARCHITECTURE_DECISIONS.md).
3. [M04 implementation and verification](../11_M04_Server_Search_and_Order_Context.md).
4. [Connected local-run guide](../10_Foundation_Implementation_and_Local_Run.md).
5. [Original v2 assessment and prioritized plan](../09_V2_Gap_Assessment_and_Implementation_Plan.md).
6. [Backend M04 record](../../../RadIntel-AI/docs/07_M04_Server_Search_and_Order_Context.md), [backend implementation history](../../../RadIntel-AI/docs/IMPLEMENTATION.md) and [PACS limits](../../../RadIntel-AI/docs/IMAGING.md).

The seven original PDFs and v2 enhancement document are preserved under docs/originals with hashes. They are requirements/reference material; embedded prompts do not replace the user's current authorization.

Older backend records describe the React client, PostgreSQL tests and search/context improvements as future work. Those statements are historical. Frontend docs/10 and docs/11 supersede them for the foundation and M04 work. Do not rewrite old verification counts as though later work existed at that time.

## What works now

The backend supports explicit organization/facility onboarding, persisted memberships, patient registration, imaging orders and scheduling, claim/transition workflows, versioned manual reports, submit/review/sign, signed-text export and linked addenda. It also implements versioned published templates, checked-text capture, guarded Verbatim proposals, scoped template Q&A infrastructure, audit/outbox persistence and bounded patient-verified PACS metadata/frame retrieval.

The dedicated React client provides institution selection, dashboard/worklist, searchable registry and order picker, study context, reporting/signing/addenda, proposal review, PACS metadata/linking, templates, membership/equipment administration and audit. It has synthetic demo mode and a guarded connection to the actual local API. Narrow screens are read-only; English/Albanian navigation is present but full terminology/localization acceptance remains unfinished.

Foundation work delivered A01/A02/M01/M03: explicit API contracts, generated types and drift checks, corrected demo/API behavior, local Development authentication, disposable PostgreSQL tests and real-API browser checks. M04 then removed page-local filtering/first-100 patient lookup and blank concurrency-token workarounds. See the status matrix for exact partial/missing boundaries.

## M04 behavior to preserve

- Read-only POST searches filter the full authorized dataset before pagination. Terms are not placed in browser navigation URLs.
- Worklist filters include search, modality, status, staff urgency, assignment, exact assignee and UTC order-created bounds. Sorting is deterministic.
- Patient registry/order selection uses server search and pagination. Changing picker results retains the selected patient.
- Order context returns the authoritative order token, authorized patient projection, original-report summary and honest imaging metadata.
- A radiologist-only member sees unassigned acquired cases with patient details masked until claim. Hidden patient names cannot be used as a search oracle for those cases.
- Claim, transition, report creation, report updates/signing and PACS linking refresh context. Report conflicts preserve unsaved editor text.
- Imaging availability is Unknown and processing is NotTracked. A link count proves association only.
- Dates are order creation timestamps, not a verified acquisition/study date. From is inclusive; to is exclusive, with UI date inputs at midnight UTC.
- Substring search uses database lower/contains behavior; no full-text index, accent-folding guarantee or production-scale benchmark is claimed.

## Local operation

### Populated UI without a backend

From the frontend directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Leave VITE_DEMO_MODE=true and select Explore demo workspace. Eight synthetic cases live in memory and reset on reload. Demo signatures are simulations.

### Connected backend and frontend

Follow docs/10 for the full sequence. Prerequisites are the backend SDK pinned in global.json (9.0.308 with latestPatch), sibling Framework/AI-Framework projects and a separately prepared local development PostgreSQL database. Do not substitute TaskMetric's SDK, credentials or database setup.

The API uses the http launch profile at localhost:5300. Configure its database/identity through private environment or secret configuration. Startup never creates, migrates or seeds an application database. The prepared InitialRadiology, PacsStudyLinks and VersionedReportContent migrations/SQL (001, 002, 003) require a separate deliberate application-database preparation step. The schema-2 editor needs 003; readiness rejects pending migrations. This session has migrated only owned disposable test databases.

For local Development mode, use the explicit backend opt-ins, a private token and a stable organization UUID. The browser also needs the development user ID; roles come from persisted memberships. Simulated recent MFA must be explicitly allowed on the backend.

Frontend .env.local contains only public configuration:

```dotenv
VITE_DEMO_MODE=false
VITE_ENABLE_DEVELOPMENT_AUTH=true
RADINTEL_API_TARGET=http://localhost:5300
```

Restart Vite after changing it. Tokens stay in memory; never put tokens or database credentials in VITE variables.

The backend script scripts/Initialize-LocalDemo.ps1 previews by default. Explicit -Apply creates three synthetic cases, matching structures and an unsigned MR draft through authorized API calls; optional -PublishSyntheticTemplates publishes only its synthetic structures. It never applies schema or signs reports. Replay preserves existing cases. The guide records a previously opted-in process-only exception for this machine's AllSigned policy; this handoff grants no new policy exception or migration approval. Use npm.cmd/npx.cmd when PowerShell blocks the .ps1 shims.

## Verification record

Historical M04 verification, recorded in docs/11 and this conversation, passed (current M05A results are in the checkpoint and docs/12):

| Check                                                        | Last recorded result                                |
| ------------------------------------------------------------ | --------------------------------------------------- |
| Frontend unit/component suite                                | 29 passed                                           |
| Backend ordinary suite                                       | 60 passed                                           |
| Dedicated PostgreSQL 17 suite                                | 4 passed                                            |
| Demo Chromium suite                                          | 6 passed, including axe and mobile read-only checks |
| Actual API/PostgreSQL Chromium suite                         | 4 passed                                            |
| Build / strict types / lint / formatting                     | Passed                                              |
| Backend OpenAPI snapshot and generated TypeScript comparison | Passed                                              |

These commands were **not rerun during the initial documentation-only handoff**. M05A subsequently ran the checks recorded in docs/12. Source presence, browser last-run metadata and original document hashes were inspected now. Both browser last-run files say passed with no failed tests; source declares six demo and four API scenarios. This corroborates browser status, not a new full-suite execution or complete clinical/security acceptance.

Original-source preservation: all eight SHA-256 hashes were checked again and match. Current live PACS, institutional IdP, clinical AI, production database/role configuration and hosted CI were not verified.

For later authorized validation, run npm.cmd run test:integration. Its default Windows path uses installed PostgreSQL 17 binaries to start an owned temporary loopback cluster and migrate only newly created random radintel_test databases. It does not reconfigure the installed service or migrate an application database. Optional existing test-admin configuration must be explicitly isolated and loopback. See docs/10 for cleanup, seeder replay and command details.

## Git and workspace state

Current Git state: backend `master` @ 39ffcd3 and frontend `main` @ 7921e87 are integrated and pushed; hosted GitHub validation is green (backend run 1, frontend run 5). RI-CKPT-001, RI-DEPS-001, RI-M07A and RI-M07B are integrated. M07C is on `task/RI-M07C-viewer-tools` from 7921e87, uncommitted pending review. The older inventory in IMPLEMENTATION_STATUS.md is a historical snapshot.

11 November 2026, RI-CKPT-001 and RI-DEPS-001 integrated checkpoints: the backend work and frontend dependency upgrade were independently reviewed, committed and pushed. The RI-DEPS-001 reviewer run passed 89 ordinary backend tests, 5 PostgreSQL tests, 54 frontend tests, 6 demo browser scenarios, 7 actual API browser scenarios and 3 viewer browser scenarios, plus build. Zod 4.6.7, React Router DOM 7.18.5 and @hookform/resolvers 5.9.2 are installed; react-hook-form remains 7.91.0. Production dependency audit found zero vulnerabilities at the high-severity gate. This is the latest complete application test record; it was not rerun for M07A.

12 November 2026, RI-M07A documentation checkpoint (integrated as c411ba4): [viewer acceptance plan](../18_M07_Viewer_Acceptance_Plan.md) specifies proposed tools, layout, geometry fixtures, safety warnings, performance measurements, clinical review and bounded M07B–M07D increments. No viewer behavior or clinical outcome was newly verified, and no application tests were run for this documentation-only change.

12 November 2026, RI-M07B checkpoint: frontend-only geometry and safe navigation for the synthetic viewer proof (no viewing tools). New `GEO` and `MISMATCH` synthetic studies; slices ordered by position along the slice normal only when geometry is complete and consistent; the parent labels the image on screen with series and SOP instance UID, "slice n of m", position, orientation letters and pixel spacing; keyboard-operable series and Previous/Next slice controls; warnings for excluded multiframe or unsupported images and missing spacing; a context the backend rejects shows an identity/format message with no pixel request; a frame the backend rejects (the `TSYNTAX` unsupported-transfer-syntax fixture) shows "Image could not be shown: unsupported image format or image service unavailable. Manual reporting remains available." (owner-approved wording after Codex review). Owner decisions recorded in [docs/18](../18_M07_Viewer_Acceptance_Plan.md): core tools only (window/level, zoom, pan, slice/series navigation, length in mm) and Chrome and Edge. Implementer run after review rework (Claude, outside any sandbox): 70 frontend unit tests, build, lint, typecheck, contracts, Prettier, 6 demo browsers, 89 backend, 5 PostgreSQL, 7 actual API browsers, 6 actual API viewer browsers and 3 demo viewer browsers (`npm run test:e2e:viewer-demo`), each viewer suite on bundled Chromium, Chrome and Edge; production audit 0 vulnerabilities. Pending Codex review and owner commit/merge/push approval on `task/RI-M07B-viewer-geometry-navigation` from c411ba4.

13 November 2026, RI-M07C checkpoint: owner-approved viewer tools only — Window/level, Zoom, Pan and Length (mm) plus Reset view — through keyboard-operable RadIntel controls. OHIF 3.11.1 had shown its full toolbar and panels (capture, layout/MPR, 3D, crosshairs, segmentation, other measurement tools) since M06C; the child adapter now hides them, disables every unapproved tool and blocks OHIF hotkeys. Length shows "Length: n.n mm on image <SOP instance UID>", is disabled without pixel spacing and is never saved or added to the report. Measured 30.0 mm and 20.0 mm on the GEO fixtures. See [docs/18](../18_M07_Viewer_Acceptance_Plan.md). Implementer run (Claude, outside any sandbox): 70 unit, build, lint, typecheck, contracts, Prettier, 6 demo browsers, 89 backend, 5 PostgreSQL, 7 actual API browsers, 7 actual API viewer and 4 demo viewer browsers on bundled Chromium, Chrome and Edge; production audit 0. Pending Codex review and owner commit/merge/push approval on `task/RI-M07C-viewer-tools` from 7921e87.

## Next steps in order

1. **Review M05B locally.** M05A/M05B are implemented and locally verified. Back up and confirm the intended development database before deliberately applying prepared SQL 003 where pending (001/002 must already be applied). Application migration is not yet performed; startup never migrates. Exercise optional-field saving, history/provenance, conflict recovery, signing and export with synthetic data.
2. **Review M06C synthetic rendering locally.** Follow docs/17 and the README opt-in preview. M06B transport and the pinned OHIF proof are delivered; production viewer/clinical acceptance is not established.
3. **Next M07 viewer capabilities and acceptance.** Plan the smallest bounded tools/layout/geometry increment; validate orientation, spacing, units, performance, supported browsers, accessibility and clinical acceptance. Proof widgets are not already calibrated/accepted tools.
4. **Resolve M02 before real-data release.** Choose/configure the institution IdP and OIDC/PKCE or BFF approach, recent-MFA/reauthentication policy, membership/provisioning journey and HTTPS/session hosting. Identity planning can proceed alongside synthetic viewer work; it remains a release prerequisite.
5. **Then M08-M10 secure intake/extraction/review.** Agree formats/storage/quarantine/retention/job contracts and patient matching before upload/extraction implementation.
6. Continue M11 accessibility/localization/testing throughout. React scheduling/admin completion, dispatch, PDF/delivery, approved references, dictation, comparisons and analytics remain separately prioritized work.

Phase 3 findings/segmentation/AI triage requires explicit intended-use, model/data, governance and validation gates. It is not authorized by a generic request to continue the frontend.

Use [NEXT_SESSION_PROMPT.md](NEXT_SESSION_PROMPT.md) to resume in a fresh conversation.

## Historical M05B verification checkpoint

<!-- M05_CHECKPOINT_START -->

31 October 2026: **M05B implemented and locally verified**. Passed: 74 ordinary backend tests, 5 PostgreSQL tests, 37 frontend tests, 6 demo Chromium scenarios and 7 actual API/PostgreSQL Chromium scenarios. Build, lint and backend OpenAPI/generated TypeScript drift checks passed. Final repository-wide formatting check passed. All 8 original source hashes match. Migration 20261031120234_VersionedReportContent / SQL 003 is prepared; application databases remain unmigrated. No commit, push, branch switch or Git-ref change. Backend remains master at 52a42eddefc7b78c0b879942d817856a462dbeae; frontend has no Git repository. See [M05B record](../13_M05B_Versioned_Content_and_Provenance.md).

<!-- M05_CHECKPOINT_END -->

## M05B implementation scope

Optional indication/technique are available in editor, history, conflict comparison, proposal acceptance, sign confirmation and signed export. Empty values persist as null; no referral inference occurs. Each new editor revision uses schema 2 with server-created actor/section/prior-version attribution. Accepted proposals retain scoped source IDs and provider metadata. Legacy revisions explicitly show unavailable historical origins.

Legacy signature hashing and old export text remain unchanged. Schema-2 hashing covers all sections and exact stored provenance. Signed reads/exports verify their content hashes. These hashes support application integrity checks; they are not independently timestamped PKI signatures or protection against a database administrator rewriting content and hashes together.

See [M05B contract, source and validation](../13_M05B_Versioned_Content_and_Provenance.md). No autosave, diagnostic AI, clinical extraction or live identity/viewer integration is added. The application migration is prepared, not applied.

## Owner update: continuity and approximate progress (31 October 2026)

The owner reiterated that every coherent implementation, test, configuration, decision or roadmap change must be saved in the handoff during the session, not postponed until the conversation limit. Keep all four context documents aligned; record verified results, pending work and limitations, with a fresh-session entry point. No secrets.

Communicated estimate: approximately **45-55% of the planned combined backend/frontend MVP**, roughly halfway. This is qualitative engineering judgment against the roadmap, not a task-weighted metric, delivery promise or clinical readiness score. It excludes the broader Phase 2/3 roadmap. Viewer, extraction, institutional security and acceptance account for substantial remaining work. Reassess as scope and evidence change.

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
