# Frontend alignment and implementation record

Historical snapshot from 26 October 2026. For current delivery and outstanding package requirements, see [the 31 October alignment matrix](14_Original_Package_Alignment_Status.md) and [handoff](context/SESSION_HANDOFF.md). Later increments supersede the pending OpenAPI, server-search, PostgreSQL and provenance statements below.

26 October 2026. Repository: `RadIntel-AI.Frontend`; backend read-only inspection: sibling `RadIntel-AI`.

## Discovery

The frontend directory was empty, with no package manifest, application or Git repository. No applicable AGENTS.md was found in the repository or readable parent locations. The seven frontend PDFs were reviewed; the backend alignment assessment and implementation record were read, then controller/domain/service source was inspected. No instructions embedded in the PDFs were promoted to user instructions, and no additional approval gate from their master prompt was applied.

React/strict TypeScript/Vite, Router, TanStack Query, React Hook Form/Zod, Vitest/Testing Library, MSW and Playwright implement the proposed feature-first architecture. Backend .NET libraries are consumed through product HTTP endpoints only. No clinical data is placed in URLs or browser persistence; study/report selection is transient and routes use generic `/study`.

## Coverage

| Package             | Implementation                                                                                                                                              | Remaining acceptance                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 01 Product/journeys | Session/institution, dashboard, worklist, registry, new imaging orders, study context, revisions, review/sign, assistance, templates, audit, administration | Diagnostic viewer, notifications, scheduling UX, dispatcher, unread/acknowledgement workflows and server-backed saved views |
| 02 Design           | Light neutral/teal tokens, sidebar/context header, status text and colors, structured editor, provenance, confirmation dialog                               | Resizable clinical panels, terminology acceptance, complete localization and representative clinician usability             |
| 03 Architecture     | Feature modules, strict DTOs, auth/query/form boundaries, synthetic MSW mode, CI and tests                                                                  | OpenAPI generation, institution OIDC/PKCE/BFF, dependency governance, deployment configuration                              |
| 04 API/AI           | Actual `/api/v1/facilities` routes and expectedToken; redacted error states; synchronous proposals and explicit decisions                                   | AI jobs/SSE/cancel not supported by backend; no invented polling; live service integration exercise                         |
| 05 Responsive/a11y  | Desktop editing, tablet layout, small-screen read-only chrome, semantic structure and dialog focus                                                          | Manual screen reader, 200%/400% zoom, keyboard/browser matrix and specialist viewer validation                              |
| 06 Quality          | Build/type checks, unit/permission/contract and browser workflow tests, axe and CI configuration                                                            | Real PostgreSQL/PACS/IdP tests, realistic imaging performance, independent security/clinical acceptance                     |
| 07 Alignment        | Source review and explicit gaps                                                                                                                             | The embedded prompt does not authorize deployment or change the user's implementation request                               |

## Contract decisions

- Order statuses are `Requested/Scheduled/CheckedIn/Acquired/InReview/ReportDraft/Signed/Cancelled`; report statuses are separately `Draft/PendingReview/Signed`. PendingReview is not a second opinion.
- Signing requires a saved version, submit, explicit identity/version confirmation and recent MFA. The server still makes the final decision. Signed content is immutable; addenda are new unsigned reports.
- Report revision saves are explicit. Unsaved edits block navigation, submission and signing. A conflict preserves text; reload retrieves the new server token before another save. A reload does not silently overwrite dirty editor content.
- Proposal generation is synchronous. Disabled-provider/transport errors preserve manual reporting. No microphone, speech, image diagnosis or unsupported confidence number is presented.
- Worklist status/pagination are server operations. Search/modality/assignment/sorting apply to the current page and are labeled accordingly. Patient name lookup uses a bounded 100-entry registry page; missing names are not inferred. No claim of complete backend search or virtualization is made.
- Study linking returns only the new study while rotating the order token. The UI requires a worklist refresh before another order command. PACS credentials never reach the frontend.
- Current export is signed plain text; no fabricated PDF or delivery status.
- Authorization-aware UI reduces invalid actions; it does not replace server membership/assignment checks. Synthetic mock checks are scenario aids and are not security evidence for the real server.

## Viewer decision

The existing backend provides authorized persisted-study DICOMweb reads and bounded metadata, not an OHIF launch/session contract or a complete viewer. This increment supplies a lazy metadata adapter rather than inventing image rendering. A later OHIF integration needs a pinned viewer/version/license review, authenticated request integration, vendor-supported resources, study/series identity mapping, realistic synthetic datasets, browser memory/GPU measurements and clinical usability acceptance. No claim about current OHIF licensing or capabilities is made here.

## Verification limits

Local results are recorded after checks finish. CI is authored but has not run on a remote service. No deployment, database migration, real patient access, live PACS, paid provider calls or backend/shared-framework source changes were performed. This is an executable frontend foundation, not a clinically approved pilot.

## Local verification

- Production build and strict TypeScript: passed.
- ESLint and Prettier checks: passed.
- Vitest: 16 tests passed, including redacted errors, session expiry/context changes, no mutation retries, role-aware UI, logout, concurrency, signing/replay, immutable signed reports and unsigned export denial in synthetic scenarios.
- Playwright Chromium: 6 scenarios passed: claim through signature, dirty-navigation protection, Albanian navigation/mobile read-only mode, dashboard axe checks, explicit AI proposal acceptance and patient registration/order creation.
- Dashboard automated axe scan: no WCAG A/AA violations reported by the selected rules. This is not full accessibility certification.
- Synthetic screenshot: [dashboard preview](../artifacts/dashboard.png).
- All seven original PDF hashes verified against the preserved SHA256 manifest.
- `npm audit --omit=dev --audit-level=high`: did not complete because the registry audit endpoint failed DNS resolution (`getaddrinfo ENOENT registry.npmjs.org`) even outside the sandbox. No clean vulnerability-audit result is claimed.
