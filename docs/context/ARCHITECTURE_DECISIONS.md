# RadIntel architectural decisions and continuation invariants

Recorded 30 October 2026. This is a consolidated decision index, not a new architecture or an implementation authorization. Existing detailed records remain authoritative: [v2 assessment](../09_V2_Gap_Assessment_and_Implementation_Plan.md), [foundation](../10_Foundation_Implementation_and_Local_Run.md), [M04](../11_M04_Server_Search_and_Order_Context.md), and [backend implementation](../../../RadIntel-AI/docs/IMPLEMENTATION.md).

## Existing decisions to preserve

| Area                 | Decision / implementation boundary                                                                                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product ownership    | RadIntel owns clinical rules, storage and APIs. Shared Framework/AI-Framework libraries are referenced selectively; their hosts are not deployed as RadIntel.                                                                                                                                                           |
| Client               | Dedicated React/TypeScript/Vite app over HTTP contracts. The backend's legacy browser workspace is retained. React is not a .NET library consumer.                                                                                                                                                                      |
| API evolution        | Preserve existing JSON members and command response bodies. Export schema without starting the host/DB; regenerate the frontend snapshot/types and check drift. Generated types do not provide runtime JSON validation.                                                                                                 |
| Authorization        | Tenant identity plus persisted active facility membership; assigned-radiologist checks protect report actions. Browser flags/role headers cannot grant roles. Do not import TaskMetric's Forge identity or PostgreSQL FORCE RLS design into this product.                                                               |
| Local authentication | Explicit loopback Development bridge, backend /client-config capability and separate MFA opt-in. Production/JWT mode does not attach development identity headers. Institution login/BFF remains M02.                                                                                                                   |
| Persistence          | Tenant filters, tenant/facility composite relationships, optimistic concurrency and protected history through application context. Startup never migrates/seeds application databases. Dedicated tests use disposable databases. Production database-role/tamper-evident audit hardening remains a release requirement. |
| Search               | Read-only POST bodies, server-side filtering before bounded pagination, deterministic ID tie breaks, no PHI terms in navigation/audit reasons. Existing indexes remain; substring search is not indexed full-text search.                                                                                               |
| Identity disclosure  | Radiologist-only unclaimed acquired cases remain patient-masked until claim; patient-name searches must not reveal them. Claim refreshes authorized context.                                                                                                                                                            |
| Dates / images       | M04 date filters use order creation, UTC inclusive-from/exclusive-to. Image state stays Unknown and processing NotTracked until a real readiness/job contract exists. PACS links do not imply images are ready.                                                                                                         |
| Concurrency          | Use server expectedToken and authoritative context refresh after affected commands. Do not blank tokens or silently retry mutations. A 409 preserves unsaved report text.                                                                                                                                               |
| Report state         | Orders and reports have different state machines. Report PendingReview is physician review, not a second-opinion workflow.                                                                                                                                                                                              |
| History / signing    | Explicit saves create append-only revisions. Sign only the saved submitted revision with recent MFA, exact content hash and explicit confirmation. Signed originals are immutable; corrections use linked unsigned addenda.                                                                                             |
| Autosave             | Not implemented. Keystroke saves would create history without an agreed draft contract. Autosave needs separate semantics.                                                                                                                                                                                              |
| AI                   | Verbatim copies clinician-checked findings, not clinical inference. Published source matching/provenance and explicit accept/reject are enforced; acceptance creates only an unsigned revision. Manual reporting survives provider failure.                                                                             |
| Knowledge            | Scoped published-template retrieval/Q&A infrastructure is not an approved clinical-reference assistant or patient-image diagnosis.                                                                                                                                                                                      |
| PACS                 | Patient/issuer verification and protected bounded DICOMweb access through the backend. No upstream secret in the browser. Metadata UI is not a diagnostic viewer.                                                                                                                                                       |
| UI / data handling   | Transient credentials/query state, no browser clinical persistence, guarded navigation, desktop editing and small-screen read-only review. English/Albanian navigation is partial localization.                                                                                                                         |
| Delivery             | Signed text export and atomic outbox intent are implemented. PDF delivery, dispatcher retries/dead-letter/acknowledgement and recipient grants are not.                                                                                                                                                                 |
| Source documents     | Seven PDFs plus v2 enhancement source remain unchanged with hashes. Embedded document instructions are reference material, not user authorization.                                                                                                                                                                      |

## Clinical states

Order: Requested -> Scheduled or CheckedIn -> Acquired -> InReview -> ReportDraft -> Signed, with cancellation only through allowed transitions.

Report: Draft -> PendingReview -> Signed. Addenda are separate reports linked to the signed original. The domain implementation is the exact authority for permitted edges; do not infer every pair from this abbreviated sequence.

## M05 decisions implemented

- M05A conflict comparison remains explicit and guarded; no automatic merge/save. Signed versions remain locked.
- M05B indication and technique are optional, max 4000 characters each, trimmed and blank-to-null. No clinical source is inferred from referral.
- Existing requests default to content schema 1. New editor submissions use schema 2. Legacy writes cannot discard extended sections or downgrade an existing schema-2 report.
- Historical four-field digest remains unchanged. Schema 2 uses a domain prefix, fixed field order, UTF-16 length prefixes and SHA-256 over UTF-8, including exact stored server-generated provenance JSON. Never reserialize stored provenance when verifying old signatures.
- Attribution records immutable revision actor, per-section origin, prior revision and accepted proposal/transcript/template/provider metadata. Retained/edited origins link history; manual submission does not assert externally verified source. Clients cannot supply provenance. Legacy rows stay schema 1 with unknown historical origins.
- Additive migration defaults old rows to schema 1; rollback refuses to destroy any schema-2 row. Startup never migrates application databases.
- Autosave and extraction provenance remain separate future contracts. No keystroke revisions or document-source claims.

Detailed decisions are recorded in [M05B](../13_M05B_Versioned_Content_and_Provenance.md), referencing M05A compatibility rather than replacing it.

No new provider/model/viewer/storage/hosting choice is made by this handoff. Those decisions require their recorded product, clinical and operational inputs.

## Historical M05B verification checkpoint

<!-- M05_CHECKPOINT_START -->

31 October 2026: **M05B implemented and locally verified**. Passed: 74 ordinary backend tests, 5 PostgreSQL tests, 37 frontend tests, 6 demo Chromium scenarios and 7 actual API/PostgreSQL Chromium scenarios. Build, lint and backend OpenAPI/generated TypeScript drift checks passed. Final repository-wide formatting check passed. All 8 original source hashes match. Migration 20261031120234_VersionedReportContent / SQL 003 is prepared; application databases remain unmigrated. No commit, push, branch switch or Git-ref change. Backend remains master at 52a42eddefc7b78c0b879942d817856a462dbeae; frontend has no Git repository. See [M05B record](../13_M05B_Versioned_Content_and_Provenance.md).

<!-- M05_CHECKPOINT_END -->

## Handoff maintenance policy

The owner requires all four handoff documents to stay aligned after each coherent source/test/documentation change. Update current capabilities, pending work, decisions and actual validation results together. Do not replace historical verification counts or imply an in-progress check passed.

M05A preserves the legacy digest byte-for-byte. Requiredness of future indication/technique is resolved: both optional, preserving existing reports. M05B now implements content/source/digest versioning; final evidence is recorded in the checkpoint.

## Continuity and planning clarification (31 October 2026)

The owner reiterated ongoing maintenance of all four handoff documents after each coherent change. Record implementation and actual validation separately from recommendations; save unresolved inputs, remaining work and continuation instructions before context is lost. The current recommendation is local M05B review, then M06/M07 viewer proof and acceptance; M02 identity remains mandatory before real-data release. This introduces no new viewer/identity/provider selection or implementation authorization.

The approximate 45-55% combined MVP completion figure is qualitative planning judgment, excludes Phase 2/3, and must never be presented as a measured metric or clinical readiness score. See the status document for its scope and limitations.

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

M06B decisions now implemented: additive read-only POST resources preserve existing API paths; no session table/schema changes. Exact sanitized instance JSON fingerprint is a conservative stale-context guard, not a signature. The raw-16 profile is explicitly limited and disabled by default. Existing raw DICOMweb routes are preserved; proof identity/multipart validation is applied on the new proof operations. Shared authenticated transport now invalidates in-flight responses on auth/facility changes; transient adapters clear metadata and reject stale reload completions. Renderer/GPU teardown is still M06C.

## M06C current checkpoint (2 November 2026)

**M06C pinned synthetic rendering proof is implemented and locally verified.** **OHIF 3.11.1**, source commit 3c2b027e8bc7a238ffe46ecb5f57c6c913069c3e, published SHA-512 and tarball SHA-256 are pinned in viewer/ohif.lock.json. The rejected 3.11.0 candidate had an upstream DICOM JSON initialization defect; 3.11.1 supplies the upstream guard and no vendor bundle is patched. Read [M06C implementation, preview and limits](../17_M06C_Pinned_Viewer_Proof.md).

The proof uses a separate exact-origin loopback static host, iframe and checked MessageChannel; product credentials stay in the parent. Only listed-study M06B context/frame operations are exposed. The child maps checked metadata/raw pixels to the bundled DICOM JSON source and minimal in-memory Part 10; independent dicom-parser checks preserve exact pixels/identity/geometry. No invented patient metadata, external PACS URLs, public data sources, uploads or offline clinical cache. Storage method/property writes are blocked. Closing/logout aborts transport, closes channels and removes the child frame/workers.

Opt in only in loopback Vite Development with VITE_ENABLE_VIEWER_PROOF=true; backend real-API proof still requires Imaging\_\_EnableViewerProof=true and Development/loopback. Default UI stays metadata-only. Demo synthetic CT/DX patterns are available without a database; actual API proof uses an owned archive and disposable PostgreSQL. M06C does not change backend application source/schema or report/signing semantics.

Passing final viewer checks: **3 actual API/PostgreSQL viewer cases** (CT, DX, logout during delayed pixels), including child credential absence, zero local/session storage/service-workers/cache persistence, report preservation, frame detachment and worker termination. **54 frontend tests, production build/lint and 6 standard demo browser cases passed**. The unchanged **89 backend and 5 PostgreSQL tests passed**, and the final serialized **7-case ordinary API browser rerun passed**. The first full run had one saved-report notice check time out during refresh; explicit save-response synchronization fixed the test without increasing UI timeouts or weakening assertions. Final build/lint, repository-wide formatting and generated-contract/backend OpenAPI drift checks passed. All 42 relative links resolve; all 8 original source hashes, pinned tarball SHA-512/SHA-256 and 240 extracted asset hashes match. Upstream release tag resolves to the recorded source commit. Git whitespace check passed, master/HEAD and staging unchanged. Final verification recorded 2 November 2026, Europe/Budapest.

Next is M07 tools/layout/geometry/measurement/performance/accessibility and clinical acceptance. M02 institutional identity/production hosting remains a release prerequisite. Autosave, operational workflows and M08-M10 extraction remain separate gaps. This is a bounded synthetic proof, not a clinically accepted diagnostic viewer or measured completion score. SQL 003 remains unapplied to application databases. No commits/push/staging/branch changes; preserve master/HEAD and existing work.

M06C implemented decisions: self-host the integrity-pinned official static artifact without installing its full workspace or changing product React; use a separate loopback origin to preserve the immutable prebuilt public paths; enforce exact origin/window/nonce and scoped MessageChannel operations. This refines the initial same-origin preference with tested isolation. Configure only the bundled DICOM JSON source over the product-owned adapter, block external fetches and storage, and remove the whole browsing context on close. An independent test-only parser validates the generated raw-16 wrapper. Root MIT/observed module inventory is not transitive license/security clearance.

Credential separation is verified for the current memory-bearer bridge. This proof is not a production cookie/BFF session boundary; M02 must revisit viewer hosting and session/cookie isolation before real-data use.
