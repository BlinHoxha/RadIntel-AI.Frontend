# M06B scoped viewer transport and identity proof

31 October 2026. **Implemented and locally verified.** No viewer engine or diagnostic acceptance is delivered.

## Contract

Additive read-only POST viewer-context under an imaging order accepts only a stored studyId. A study-scoped viewer-frames POST accepts series/SOP identity, frame 1 and the expected validated metadata hash. Both reuse existing membership/assignment, patient ID/issuer, before/after-I/O authorization and audit controls. No database schema change is planned.

The first proof supports only bounded single-frame unsigned 16-bit MONOCHROME2 raw little-endian CT/CR/DX images with full 16-bit storage and explicit non-lossy metadata. Other formats remain marked unsupported. It does not provide an image viewer, measurements, clinical HU calibration, compressed decoding, multiframe or acquisition-readiness claims.

## Checkpoints

- Batch 1: request/response contracts and scoped service operations added. Payload validation, API actions, frontend transport and tests remain in progress. Build/tests have not run yet.

- Batch 2: metadata/multipart validator and API actions added; authenticated binary transport and transient queued viewer adapter added. Verification pending; contracts still need generation.

- Batch 3: backend build passed; 86/87 initial backend tests passed. Corrected the new HTTP fixture membership setup to PUT and added revocation during archive I/O. Added frontend identity/binary/cancellation/queue tests and generated API types. Reruns pending.

- Batch 4: 13 focused backend viewer cases pass. Frontend 48/49 initially pass; corrected a stream test that changed context before the request rather than during delivery. Full rerun pending.

- Batch 5: synthetic proof endpoints are disabled by default and gated to Development/loopback plus Imaging:EnableViewerProof=true. Added gate regression tests; frontend rejects unsupported headers and cancels unread binary bodies. Final verification pending.

- Batch 6: metadata reload invalidates old frame context; added retained-context rejection assertion. The initial integration pass built 87 tests before proof-gate coverage; final source requires 89 backend cases.

- Batch 7: malformed-header cancellation could wait indefinitely for an unread stream tee; fixed by initiating cancellation without awaiting its peer. Final frontend rerun pending.

## Implemented API and frontend scope

- POST /api/v1/facilities/{facilityId}/imaging-orders/{orderId}/viewer-context takes {studyId}. A context holds contractVersion=1, matched study UID, support=LimitedRaw16Proof and at most 256 checked instances across at most 64 series. It is transient and not an authorization grant or acquisition-readiness signal.
- POST /api/v1/facilities/{facilityId}/studies/{studyId}/viewer-frames takes {seriesInstanceUid,sopInstanceUid,frameNumber:1,expectedMetadataHash}. It rechecks instance metadata and all existing patient/access controls before returning validated raw bytes as application/octet-stream. Unsupported data gives redacted 503; stale metadata 409; invalid frame 400; denied access 403/404.
- Set Imaging\_\_EnableViewerProof=true only for an owned synthetic loopback Development proof. Endpoints are disabled by default, unavailable outside Development and reject non-loopback requests. No new capability is granted by this configuration. Existing metadata routes remain unchanged.
- Payload validator enforces study/series/SOP identity and SOP class, required pixel description, length limits, unique instance identities, strict one-part MIME boundary/headers/length and uncompressed little-endian transfer syntax. It strips MIME framing and returns the exact expected pixel bytes. It does not render or calibrate measurements.
- Frontend requestBinary shares private credentials, redacted failures, bounded streaming and AbortSignal/context generation with JSON requests. Context invalidation aborts active requests; viewer adapters also clear their retained metadata and pending queue. At most two reads and 32 queued calls are allowed. Pixel buffers are handed to the caller; no persistent/pixel cache is introduced. Future renderers own disposal of returned buffers/GPU state.
- createViewerTransport is an isolated adapter module, not currently mounted in ImagingPanel. Existing manual report UI, metadata-only labeling and sign/conflict behavior remain. No thumbnail/viewport or diagnostic viewing tool is delivered.

## Source inventory

Backend: additive Contracts requests; Application/ViewerContracts.cs; partial ImagingService.Viewer.cs; ViewerPayload.cs; ImagingController actions and gate; binary OpenAPI operation annotation. Tests add ViewerTransportTests.cs and an optional synthetic archive injection/opt-in to DevelopmentApiFactory. Existing adapter routes, schema and dependency versions are preserved.

Frontend: shared/api/client.ts transport and invalidation lifecycle; features/imaging/viewerTransport.ts and its tests; regenerated api/openapi.json and generated.ts. All four context documents are updated.

## Evidence and limitations

Synthetic backend proof uses an owned Kestrel loopback DICOMweb archive and actual HTTP/multipart bytes with the real API Development auth and ephemeral SQLite. Known 2x2 pixel grid is [0,1,256,65535], little-endian bytes 000001000001FFFF. Tests cover CT/CR/DX identity/geometry, missing/wrong metadata, unsupported formats, malformed/short/long/compressed parts, stale hash, wrong instance, foreign tenant, unassigned radiologist, wrong order and revocation after archive pixels return, plus proof gate controls. This is not live PACS/vendor conformance or PostgreSQL-specific proof of the new viewer operation. The separate PostgreSQL suite retains its concurrency/migration role.

Initial proof deliberately rejects signed pixels, partial-bit storage, MONOCHROME1/color, enhanced/multiframe and compressed forms. Optional geometry/rescale values are carried when present; a supported raw payload is not clinically validated geometry/HU/measurement support. No advanced bulk-data URLs or complete DICOMweb root are introduced. Existing 16 MiB/60-second bounds remain.

Metadata hash currently fingerprints the exact sanitized instance JSON. Equivalent metadata with a different field order/serialization may conservatively conflict and require context reload; vendor-format compatibility/canonicalization is unproven. The hash is a stale-context check, not a digital signature or proof that an archive supplied truthful pixels.

Archive credential stays server-side. Revocation prevents subsequent delivery after server detection, but bytes already returned cannot be recalled. Disposal prevents adapter reuse and clears its retained metadata; M06C must prove renderer/decoder/worker/GPU cleanup. M02 production identity/hosting and M07 browser/performance/clinical acceptance remain open. No application database was migrated; SQL 003 from M05B still requires a deliberate application setup step.

For the raw media/transfer-syntax assumption, see [DICOM PS3.18 bulk-data media types](https://dicom.nema.org/Medical/dicom/current/output/chtml/part18/sect_8.7.3.3.html). This restricted proof accepts application/octet-stream with Explicit VR Little Endian transfer syntax (or its default), and rejects compressed part types.

## Final validation (31 October 2026)

| Check                                                 | Result                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Ordinary backend                                      | 89 passed: previous 74 plus 15 viewer/profile/HTTP/gate cases                                    |
| PostgreSQL 17                                         | 5 passed on owned disposable databases; existing concurrency/migration/signature/outbox coverage |
| Frontend                                              | 49 passed: previous 37 plus 12 viewer binary/lifecycle/queue cases                               |
| Demo Chromium                                         | 6 passed                                                                                         |
| Actual API/PostgreSQL Chromium                        | 7 passed on stable frontend source                                                               |
| Backend/frontend build, lint                          | Passed                                                                                           |
| Backend OpenAPI and generated TypeScript drift        | Passed                                                                                           |
| Documentation formatting/relative links/source hashes | Final check recorded in the handoff                                                              |

The first full integration command passed its 87-case backend and five PostgreSQL suites but had one browser login-screen failure during frontend editing. After adding the two proof-gate cases, a separate final ordinary run passed 89 and the stable browser-only integration rerun passed all seven. The disposable databases/clusters were removed/stopped by their owning runner. A transient shared-assets NuGet failure was resolved by force-restoring existing pinned dependencies; no version changes occurred.

Initial test fixture mistakes and the stream cancellation defect were corrected with assertions retained; see dated batch notes. No application migration, live archive, hosted CI, dependency/security audit, viewer decoding runtime or diagnostic acceptance is asserted. Default UI is still metadata-only. Backend remains master/HEAD 52a42eddefc7b78c0b879942d817856a462dbeae with existing and new uncommitted work; frontend is not a Git repository. No commits, pushes, staging or branch changes.

## Next step

M06C: select and pin the exact self-hosted OHIF build after checking its release, dependency/notices and supported hooks; implement its custom source over this validated transient transport; prove CT/X-ray rendering, request privacy, worker/GPU cleanup and measured synthetic performance. M07 remains the full tool/geometry/browser/clinical acceptance step. M02 identity and outstanding autosave/operational/extraction requirements remain on the original roadmap.

1 November follow-up: [M06C pinned synthetic rendering proof](17_M06C_Pinned_Viewer_Proof.md) now renders CT/DX through the actual API with scoped transport and cleanup/privacy checks. This is a bounded proof; diagnostic tools, vendor/geometry/performance/accessibility and clinical acceptance remain M07. Earlier dated scope/evidence above is preserved.
