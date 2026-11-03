# RadiologyAI.Frontend — Requirements Enhancements v2.0

**Document:** 08_FRONTEND_REQUIREMENTS_ENHANCEMENTS_V2.md  
**Status:** Proposed extension; not an implementation audit  
**Applies to:** Existing seven-document Radiology AI frontend baseline  
**Audience:** Product owner, frontend/backend engineers, clinical advisors, Codex

## 1. Purpose and precedence

Extend the existing frontend documentation without replacing it. Preserve working functionality and existing architecture unless a justified, reviewed change is required. This document adds detailed requirements for ten radiology workflows, their UI states, backend dependencies, safety controls, and implementation phases. Where requirements conflict, record the conflict and seek approval; do not silently override the baseline.

**Important:** Features below are requirements and proposals, not claims that the repository already implements them. Clinical decision-support and image interpretation capabilities require appropriate validation, regulatory assessment, and clinician oversight before clinical use.

## 2. Target users and roles

- **Radiologist:** review studies, inspect images, edit and sign reports, verify AI suggestions.
- **Radiology technician:** intake studies, check metadata and image availability; cannot sign clinical reports.
- **Clinic administrator:** manage authorized staff, operations and nonclinical analytics.
- **Referring clinician:** access authorized finalized reports and relevant studies.
- **Patient (later phase):** access finalized reports and approved plain-language explanations only.

Implement role- and tenant-aware navigation; enforce permissions in the backend, not solely in UI.

## 3. Use-case matrix and implementation scope

| ID | Capability | Phase | Key frontend screens / components | Required backend dependency |
|---|---|---|---|---|
| RAD-01 | Patient and imaging study management | MVP | Worklist, patient summary, study details, status filters | Patients/studies API, authorization, audit |
| RAD-02 | DICOM viewing | MVP | Viewer workspace, series selector, metadata panel | DICOMweb/PACS gateway, signed access, study authorization |
| RAD-03 | Structured report drafting and sign-off | MVP | Report editor, draft/version history, approval flow | Report templates, versioning, signature/approval endpoints |
| RAD-04 | Clinical document extraction | MVP | Upload, extraction review, correction UI | Secure upload, OCR/NLP extraction, provenance, async jobs |
| RAD-05 | RAG clinical reference assistant | Phase 2 | Evidence-linked assistant, source viewer | Curated reference corpus, retrieval API, citation IDs |
| RAD-06 | Prior/current scan comparison | Phase 2 | Side-by-side viewer, synchronized navigation where supported | Prior-study matching, retrieval, registration metadata |
| RAD-07 | Voice-to-report | Phase 2 | Dictation recorder, transcript review, report insertion | Speech service, language support, consent/retention policy |
| RAD-08 | Patient-friendly report explanation | Phase 2 | Explanation preview, clinician approval, patient view | Final-report-only explanation API, approval and publishing |
| RAD-09 | Operational analytics | Phase 2 | Clinic dashboard, turnaround and backlog charts | Aggregated metrics API, RBAC, privacy controls |
| RAD-10 | Validated diagnostic image AI | Phase 3 | Candidate findings, overlays, uncertainty, review controls | Authorized validated models, inference, model metadata, audit |
| RAD-11 | Lesion segmentation and measurements | Phase 3 | Segmentation overlays, measurement corrections | Validated segmentation, calibrated DICOM geometry, persistence |
| RAD-12 | Urgent-study prioritization | Phase 3 | Worklist priority indicators and alert review | Validated triage model, escalation rules, monitoring |

## 4. Screen-level requirements

### 4.1 Worklist and study details (RAD-01)
- Filter by study status, modality, date, facility, assignment and urgency; distinguish clinician-entered priority from AI-generated triage.
- Show processing state, image availability, report state and audit-friendly timestamps.
- Support empty, loading, partial, error and unauthorized states.
- Never display PHI in client telemetry, URLs or notifications unless explicitly approved and protected.

### 4.2 DICOM viewer (RAD-02)
- Prefer integrating a mature viewer such as OHIF with DICOMweb where appropriate; evaluate license, deployment and integration constraints.
- Support series navigation, window/level, zoom/pan and available measurements with correct units and calibration.
- Preserve image provenance and show warnings for incomplete/unsupported studies.
- Do not implement ad hoc diagnostic image rendering or infer clinical findings in the browser.

### 4.3 Structured reporting (RAD-03)
- Report editor with indication, technique, findings and impression, as applicable to template.
- Distinguish clinician-entered content, imported text and AI-generated suggestions; allow editing before sign-off.
- Explicit draft, in-review, approved/signed and amended states; display authorship, timestamps and version history.
- Prevent frontend-only approval; backend validates role, state and signature requirements.

### 4.4 Document extraction (RAD-04)
- Upload supported formats with progress and validation; show extraction confidence only when meaningfully calibrated.
- Display original source alongside extracted fields; require confirmation of patient/study matching.
- Provide correction controls and preserve original vs corrected values for audit.

### 4.5 RAG knowledge assistant (RAD-05)
- Show citations linking to approved guidelines or documents, including version/publication date when available.
- Clearly distinguish retrieved evidence from model synthesis and from patient-specific facts.
- Handle missing evidence by stating uncertainty rather than fabricating sources.

### 4.6 Prior study comparison (RAD-06)
- Side-by-side current and prior studies, with dates/modality and series labels.
- Support synchronized navigation only when technically compatible; warn when comparisons are not registered or directly comparable.
- Track clinician-confirmed measurements and changes separately from algorithmic suggestions.

### 4.7 Dictation (RAD-07)
- Explicit microphone permission, recording indicator, stop/cancel, transcript preview and correction before insertion.
- Validate Albanian and English accuracy with domain-specific terminology before relying on transcription in clinical workflows.
- Do not auto-sign or auto-publish generated reports.

### 4.8 Patient explanation (RAD-08)
- Only derive explanations from finalized clinician-approved reports.
- Provide an approval preview and preserve a link to the original report; label explanations as educational.
- Do not provide independent diagnoses or treatment directives.

### 4.9 Analytics (RAD-09)
- Display study counts, turnaround-time distributions, pending worklists, and report completion metrics.
- Use aggregated data by default; enforce organization-level access restrictions.
- Explain definitions of metrics and distinguish operational statistics from AI predictions.

### 4.10 Advanced diagnostic AI (RAD-10–12)
- Clearly mark model-generated candidate findings as unverified until clinician review.
- Display modality, intended use, model/version, execution timestamp, source series and limitations.
- Support accept/reject/edit with reviewer identity, reason and immutable audit trail.
- Overlay coordinates must be correctly mapped to the underlying DICOM image; measurements require calibrated image geometry.
- Never allow AI urgency indicators to silently replace existing clinical triage procedures; alert escalation requires explicit validated policy.
- If inference is unavailable, the normal clinical workflow must remain usable.

## 5. Reusable frontend framework integration

### Frontend.Framework (generic)
Adopt reusable UI primitives, themes, form adapters, API clients, authentication integrations, query caching, localization, accessibility, notifications, file upload infrastructure and telemetry as packages **only where available and stable**. Do not assume these libraries already exist. Keep app-specific compositions and clinical data models local.

### Frontend.FrameworkAI (AI-specific)
Adopt reusable streaming UI, cited answers, AI task status, feedback, structured result presentation and human-review primitives as appropriate. The shared AI framework must not contain DICOM processing, radiology-specific labels, clinical diagnosis rules or patient data models.

### Dependency boundaries
`RadiologyAI.Frontend -> Frontend.FrameworkAI -> Frontend.Framework` (with direct imports from Frontend.Framework as needed). Both reusable libraries communicate with backend services through explicit contracts; neither imports the Radiology application. Avoid duplicating shared components prematurely; extract only proven reusable patterns.

## 6. API and data-contract alignment

Before implementing each feature, verify actual backend routes and schemas. Treat these as **proposed resources**, not existing endpoints:

- `patients`, `studies`, `series`, `reports`, `report-versions`, `report-approvals`
- `documents`, `extraction-jobs`, `extraction-corrections`
- `reference-queries`, `reference-citations`
- `prior-study-links`, `comparisons`, `measurements`
- `transcription-jobs`, `report-explanations`, `explanation-approvals`
- `analytics/operations`, `ai-inference-jobs`, `ai-findings`, `ai-reviews`

Use OpenAPI-generated TypeScript types where possible. Every asynchronous job needs a stable ID, status, error information, cancellation semantics if supported, and idempotent polling or event updates. Handle stale data and concurrent edits explicitly. All access is authorized on the server.

## 7. Security, privacy and clinical safety

- Use synthetic or properly de-identified datasets for initial development and demos.
- Apply least privilege, tenant isolation, protected transport, safe session handling, audit logging and data minimization.
- Avoid storing DICOM images, patient records, tokens or AI transcripts in localStorage or browser telemetry.
- Do not expose model API keys in frontend code.
- Distinguish assistive documentation features from regulated clinical decision support; obtain appropriate clinical, privacy and regulatory review before real-world deployment.
- Ensure human approval of clinically significant generated content and prevent unsupported medical claims.

## 8. Nonfunctional requirements and testing

- Accessibility: keyboard navigation, focus management, sufficient contrast, screen-reader labels; evaluate image-viewer-specific accessibility limitations.
- Performance: lazy-load viewer and AI modules; virtualize long worklists; avoid fetching full studies when only metadata is required.
- Reliability: resilient empty/error states, retries only for safe operations, cancellation and reconnect handling.
- Testing: unit tests for state and permissions; component tests for editors/review; contract tests against backend schemas; end-to-end tests for upload -> draft -> clinician approval.
- Clinical visualization: test DICOM orientation, pixel spacing, measurements, overlay mapping, series identity and model version provenance using validated test fixtures.

## 9. Prioritized implementation plan

**Phase 0 — Audit and contracts:** inspect repo and all seven baseline documents; list implemented/partial/missing features; map existing backend endpoints; identify contradictions and dependencies; obtain approval.

**Phase 1 — Operational MVP:** worklist, study detail, DICOM viewing, document extraction review, structured reporting, approval/audit, tenant and role enforcement.

**Phase 2 — Productivity AI:** RAG reference assistant, prior-study comparison, dictation, approved patient explanations and operational analytics. Deliver incrementally, with tests and clinical review.

**Phase 3 — Advanced clinical AI:** only after model availability, intended-use definition, validation evidence, applicable regulatory review, workflow safeguards and specialist approval. Implement inference overlays, segmentation, measurement and triage incrementally.

## 10. Codex instructions and acceptance deliverables

1. Read the existing seven frontend documents and this enhancement file; do not assume any feature is implemented.
2. Inspect the frontend repo, package dependencies, routing, design system, tests and actual backend integration points.
3. Produce a feature matrix with **implemented / partial / missing / blocked**, linking each status to concrete source files or endpoints.
4. Identify baseline-v2 conflicts and proposed resolutions. Do not overwrite the baseline silently.
5. Identify which reusable packages actually exist in Frontend.Framework and Frontend.FrameworkAI; suggest integration only when justified and compatible.
6. Provide proposed screen map, component boundaries, API contract gaps, security risks, and phased implementation tickets with acceptance criteria.
7. Keep clinical image processing and domain logic in application/backend services, not in generic shared packages.
8. Do not implement advanced diagnostic AI, regulated clinical functionality or breaking architectural changes without explicit approval.
9. Present the audit and plan first; wait for authorization before coding.

**Definition of done for the assessment:** grounded feature inventory, dependency map, backend contract gap list, risk register, prioritized tickets, and an explicit approval checkpoint.
