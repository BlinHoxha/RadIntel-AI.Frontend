# M06C pinned self-hosted OHIF rendering proof

Implemented 1-2 November 2026, Europe/Budapest. **Implemented and locally verified as a bounded synthetic proof.** Clinical viewing acceptance remains M07.

## Approach recorded before implementation

Use official @ohif/app 3.11.1 prebuilt static artifact (3.11.0 was rejected during proof), verified by the published SHA-512 integrity, rather than installing its full monorepo dependencies or altering the reporting app React version. It is a fixed synthetic proof candidate, not a latest-version/support/security acceptance claim.

A separate loopback static viewer origin avoids modifying upstream compiled public-path behavior or loosening product API CSP. This refines M06A's proposed same-origin iframe: the exact parent/child origins, source window, nonce and MessageChannel are checked. Product credentials remain in the parent; the child receives only checked metadata and requested raw bytes through M06B transport. No PACS endpoint/token or study/patient identifier is put in navigation parameters.

An app-owned adapter maps the validated context to OHIF's bundled DICOM JSON data source. Only that source is configured; public upstream sources, uploads and arbitrary URL configuration are excluded. Raw proof pixels will be wrapped in minimal explicit-VR little-endian Part 10 data in memory for its existing image loader. No resampling or diagnostic interpretation is added. Rendering, privacy, memory and cleanup must be demonstrated before marking M06C complete.

## Checkpoints

- Batch 1: inspected current source, official version-specific source/docs and package metadata. Downloaded @ohif/app 3.11.0 to ignored .tools and verified published SHA-512. Runtime adapter and tests remain pending. No schema, report semantics, commits or branches changed.

- Batch 2: local static host, artifact preparation, checked bridge, in-memory Part 10 wrapper and opt-in iframe UI implemented. No runtime pass is claimed yet.

- Batch 3: added deterministic CT stack/DX fixtures and opt-in demo routes, plus exact-origin parent bridge. Isolated proof servers use ports 5192/5194 for verification, leaving the existing user preview alone. Build/browser checks pending.

- Batch 4: 3.11.0 shell loaded but failed before rendering because its DICOM JSON path dereferenced missing series.instances. Official 3.11.1 has the upstream guard; pinned proof candidate is being changed to 3.11.1. No upstream bundle patch. Added actual API/PostgreSQL viewer test scaffolding and owned fixture lifecycle. Rendering/cleanup not yet verified.

- Batch 5: fixed pin is now 3.11.1 (official artifact, no bundle patch). Added integration runner mode with own archive and viewer processes, real API study linkage and isolated Part 10 encoder. Final rendering/cleanup checks pending.

- Batch 6: CT actually rendered via product API/PostgreSQL, then failed the strict zero-storage assertion. Blocked direct property writes as well as setItem in the isolated child; made fixture replay safe after worker restarts. Final CT/DX verification pending.

- Batch 7: all 54 frontend tests pass. Explicit Node type dependency is being pinned to fix clean-build Node imports; added root notice and dependency inventory. CT/DX final privacy/cleanup run pending.

- Batch 8: added child credential/cache/worker/privacy assertions and logout-during-pixel-I/O coverage, with one-shot first-frame timing. Final stable-source verification pending.

- Batch 9: first real API CT/DX rendering/privacy/frame-disposal run passed (5593/5213 ms observed). Stronger worker/cache/credential and mid-load logout assertions are added for a final three-case rerun. Added demo run instructions and honest opt-in labels.

## Implemented architecture and runtime scope

- Fixed @ohif/app **3.11.1**, source commit **3c2b027e8bc7a238ffe46ecb5f57c6c913069c3e**. Exact artifact URL, published SHA-512 and SHA-256 are in [ohif.lock.json](../viewer/ohif.lock.json). prepare-viewer verifies the tarball, extracts only safe file paths below ignored .tools/ohif/3.11.1, and records hashes of served upstream files. No upstream bundle source is edited.
- Product React and OHIF React run in separate browsing contexts. The own loopback static host is a refinement of the initial same-origin proposal: it preserves the prebuilt artifact's absolute asset paths without patching webpack/public-path internals or broadening the API CSP. The server binds 127.0.0.1, serves only verified artifact assets and own config/bootstrap/encoder, applies no-store/no-referrer and restrictive CSP, and names one exact loopback parent origin.
- ViewerProof is lazy-loaded behind Development + loopback + VITE_ENABLE_VIEWER_PROOF=true, default false. It opens a generic /viewer/dicomjson?url=/radintel-context.json URL with a random handshake nonce in the fragment; no patient/study identity or token is placed in navigation. Parent checks child origin, iframe window and nonce before transferring a dedicated MessageChannel. Only context and bounded listed-instance frame operations are accepted.
- Parent retains product credentials and uses createViewerTransport/M06B API calls. Child receives only validated context and requested pixels, with no product/PACS credentials or upstream endpoints. All ordinary authorization, patient matching and post-I/O revocation checks remain backend-owned. No new backend application code, schema, clinical permissions or report/signing behavior is introduced by M06C.
- The own adapter maps checked context to OHIF's bundled DICOM JSON source; only this source is configured. It generates minimal explicit-VR little-endian Part 10 wrappers in memory for the existing WADO loader, preserving checked study/series/SOP IDs, pixels and supplied geometry/rescale values. It does not invent a patient identity or clinical acquisition date, perform resampling, or claim calibrated measurements. Missing metadata remains missing.
- Child request shims handle only the fixed context resource and opaque frame indexes. External fetch/XHR is rejected; arbitrary PACS URLs/configuration/upload/store paths are not enabled. The iframe sandbox excludes downloads/popups/navigation permissions. Existing upstream investigational-use labeling is retained.
- Upstream service-worker initialization is excluded from the wrapper HTML. Storage facade blocks both setItem and direct property writes in local/session storage. Clinical data is not persisted. Closing/logout/context invalidation closes ports, aborts M06B transport and removes the whole iframe browsing context; dedicated workers are checked for termination in browser tests. The original manual report editor remains mounted and unsaved text is retained on viewer close.
- Initial configuration sets one decoder worker, two interactive requests, one thumbnail request, no prefetch and a 64 MiB Cornerstone pixel cache ceiling. The upstream source reads maxCacheSize and calls cache.setMaxCacheSize. This does not establish a total process/VRAM ceiling or a clinical-scale performance benchmark.

## Sources and test fixtures

New viewer/ files hold pin, fixture hashes, declared/observed dependency inventory, notices, own bootstrap/config/Part 10 encoder and deterministic synthetic fixture generator. New scripts prepare and serve the static host and run an owned synthetic HTTP DICOMweb archive. The existing integration runner adds a --viewer mode: onboard the synthetic facility through the actual API, restart only its owned API with scoped synthetic PACS configuration, run the pinned viewer host/browser cases, then clean up archive/viewer/API/database/cluster. Existing default integration mode remains available for regression.

CT is a generated 64x64 three-instance stack; DX is one generated 128x128 instance. Gradient/circle patterns test pixel paths, not anatomy or diagnostic quality. Source metadata and raw-frame hashes are recorded in [fixtures.lock.json](../viewer/fixtures.lock.json). Five independent dicom-parser checks verify exact pixel bytes, identity, transfer syntax, geometry and known fixture values, plus rejection of truncated data.

Two pinned dev dependencies were added: dicom-parser@1.8.21 for independent interoperability checks and @types/node@22.13.10 to make Node imports explicit in the existing test harness. Product React/runtime dependency versions were not changed; the large upstream workspace was not installed. [NOTICE](../viewer/NOTICE.md) and [dependency inventory](../viewer/dependency-inventory.json) retain licensing/inspection limits. Root MIT is not full transitive codec/font/security clearance.

## Local preview

Use [README viewer steps](../README.md#optional-local-synthetic-viewer-proof): prepare once, run viewer:serve in terminal 1, then run the demo UI with VITE_ENABLE_VIEWER_PROOF=true in terminal 2. Use exact default parent http://127.0.0.1:5173 and viewer http://127.0.0.1:5184; configure RADINTEL_VIEWER_PARENT_ORIGIN for a different parent origin. Open a synthetic CT/X-ray case, select its linked synthetic study and choose Open synthetic viewer proof. Standard preview remains metadata-only with the flag off. No database or archive setup is needed for the synthetic demo.

For actual API proof use npm.cmd run test:integration:viewer. Its loopback API sets Imaging\_\_EnableViewerProof=true only for owned synthetic resources; the backend rejects proof operations outside Development/loopback. It does not prepare an application database. M05B SQL 003 remains a separate unapplied application migration step.

## Final local validation (2 November 2026)

| Check                                          | Result                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| Ordinary backend                               | 89 passed; application source unchanged in M06C                            |
| Dedicated PostgreSQL 17                        | 5 passed on owned disposable databases                                     |
| Frontend                                       | 54 passed, including 5 independent DICOM-wrapper/fixture cases             |
| Standard demo Chromium                         | 6 passed on isolated port 5191                                             |
| Ordinary actual API/PostgreSQL Chromium        | 7 passed in final serialized rerun                                         |
| Actual API/PostgreSQL OHIF Chromium            | 3 passed: CT, DX, logout during delayed pixel delivery                     |
| Product build / lint                           | Passed                                                                     |
| Formatting / API drift / source hashes / links | Passed; 42 links, 8 original hashes and pinned tarball/240 assets verified |

Viewer browser assertions cover actual connected-canvas image rendering, unsaved report preservation, no credential headers to the viewer origin, no external request origins, zero local/session storage/service-worker/cache persistence, frame detachment and worker termination. Observed first-frame times were about 5.2-5.6 seconds in an initial run and 12.7-14.4 seconds during the stronger concurrent run. These are local smoke observations, not a clinical-scale throughput/latency acceptance benchmark. Screenshots: [CT proof](../artifacts/viewer-ct.png) and [DX proof](../artifacts/viewer-dx.png).

The full ordinary command passed backend/PostgreSQL suites but had one saved-report notice assertion time out during refresh. Explicit save-response synchronization was added to that browser test, with its UI assertion and timeout retained; the serialized browser-only rerun passed all seven. Early fixture replay, Node-type declaration and child storage-write issues are documented in chronological batch notes above. No pass is inferred from those failed attempts.

Owned test databases/clusters, API, archive and viewer hosts were cleaned up by their runners. Backend remains on master at 52a42eddefc7b78c0b879942d817856a462dbeae, staging unchanged; frontend has no Git repository. No application migration/commit/push/branch switch. No hosted CI, live PACS, fresh vulnerability audit or clinical acceptance is claimed.

## Remaining boundaries

M07 remains for full tool/geometry/measurement, panel layout, keyboard/accessibility/browser/GPU/performance and clinician acceptance. The proof is limited to the M06B unsigned single-frame raw-16 profile; compressed/color/MR/enhanced/multiframe support remains absent. Exact sanitized metadata JSON hashes can conservatively conflict if vendor serialization differs. No complete acquisition-readiness/ingestion model is added.

Proof display ordinals are generated from the current list and do not establish clinical acquisition order. The child may display incomplete demographic/date labels because the scoped context intentionally omits patient demographics/acquisition date; the parent identity banner remains authoritative. All demonstrated pixels are synthetic patterns. A removed frame/worker is observable cleanup, not a measured VRAM reclamation guarantee. Repeated large-study stress, production artifact hosting/identity, resolved SBOM/security/license review and real vendor/clinical validation remain open. M02 is still a real-data release prerequisite. Autosave, operational workflows and extraction remain separately tracked original-package gaps.

Backend stays on master at the preserved HEAD with existing uncommitted work; frontend remains outside Git. No commit/push/merge/branch switch or application migration is performed.

- Batch 10: demo browser regression configuration accepts an owned port (RADINTEL_DEMO_TEST_PORT) and explicitly selects baseline demo mode, protecting the user preview. Final verification is in progress.

- Batch 11: frontend 54/build/lint pass. Default integration backend/PostgreSQL suites passed; API browsers 6/7, with an already-saved report still awaiting UI refresh at the notice assertion. Added explicit save-response synchronization, retained UI assertion/timeouts. Final serialized rerun pending.

All batch notes above are historical checkpoints. This final validation section and the current handoff supersede earlier pending/failed statuses.

Final verification on 2 November 2026: repository-wide formatting, generated TypeScript/backend OpenAPI comparison and Git whitespace checks passed. All eight original source documents match their hashes; pinned tarball SHA-512/SHA-256 and all 240 extracted assets match. The upstream 3.11.1 release tag resolves to source commit 3c2b027e8bc7a238ffe46ecb5f57c6c913069c3e. All three retained browser suite status files report passed.

Minimal Part 10 wrappers validate this render path and parser interoperability; they are not a full clinical IOD-conformance validation or original archive export. Credential separation was checked for the current memory-bearer transport; future M02 cookie/BFF hosting/session isolation requires its own review.
