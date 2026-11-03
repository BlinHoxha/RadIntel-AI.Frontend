# M04: server search and authoritative order context

29 October 2026. Increment following the [v2 assessment](09_V2_Gap_Assessment_and_Implementation_Plan.md) and [foundation work](10_Foundation_Implementation_and_Local_Run.md). The assessment and original eight source documents remain historical records.

## Delivered behavior

Worklist search, modality, status, assignment, urgency and sorting now operate on the whole authorized dataset before pagination. The UI exposes all/mine/urgent/unassigned views, exact assigned user ID for registry staff, and order-created date bounds. Changing filters resets the worklist to page one. Free-text searches and assignee input are debounced by 300 ms. Summary cards explicitly distinguish the matching total from counts on the displayed page.

The patient registry uses server search with 30-item pages. Order creation has patient search and pagination and preserves a selected patient when the search changes. Worklist rows contain an authorized patient projection instead of resolving names through the first 100 registry records. Opening a case loads its authoritative order context directly.

Claim, transition and report creation refresh that context. PACS linking refreshes context after linking rather than clearing the order token. Report saves, submission, signing and accepted proposals refresh context without replacing dirty editor text. A failed background context refresh retains the mounted editor; order actions remain disabled until context can be refreshed. Existing report-conflict recovery still preserves unsaved text.

## Additive API contract

All paths below are relative to `/api/v1/facilities/{facilityId}` and retain membership and tenant authorization.

| Method/path                       | Result                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `POST patients/search`            | Existing patient page shape; `search`, `page`, `pageSize` in body.                              |
| `GET patients/{id}`               | Authorized patient detail; unavailable records return 404.                                      |
| `POST worklist/search`            | Page of order context projections with accurate filtered total.                                 |
| `GET imaging-orders/{id}/context` | Current order and command token, authorized patient, original-report summary and imaging state. |

Legacy GET lists and command response bodies are preserved. The frontend schema snapshot and generated TypeScript contracts include the new routes.

Worklist body fields: `search`, `status`, `modality`, `priority`, `assignment`, `assignedTo`, `createdFrom`, `createdTo`, `sort`, `page`, `pageSize`. Priority is staff-entered `Routine`/`Urgent`; assignment is `All`/`Mine`/`Unassigned`/`Assigned`; sorting is `CreatedDesc`/`CreatedAsc`/`UrgentFirst`. Sort ties resolve by order ID. Pages are bounded to 1-10000 and sizes to 1-100. Text is bounded to 200 characters. Invalid filters and conflicting assignments return validation errors.

Dates refer to **order creation**, because the current model has no reliable study acquisition date. `createdFrom` is inclusive; `createdTo` is exclusive. UI date inputs represent midnight UTC and are labeled accordingly. Row timestamps continue to use the user's locale. This is not a study-date filter or an operational turnaround event model.

## Access and imaging semantics

Administrator/scheduler/technician registry access remains unchanged. A radiologist-only member sees their assigned cases and unassigned acquired cases. Until claim, an acquired case has `patient: null`, `patientAccess: ClaimRequired` and no report summary. Searching by a hidden patient name/identifier cannot reveal that case. Access to the same patient through another assigned case does not unmask this order. Claim refreshes the projection and token. Report contents remain behind the existing assigned-radiologist boundary.

Imaging state is explicitly `Unknown`; processing is `NotTracked`. Linked-study count records associations only. No readiness, successful ingestion, missing images or diagnostic capability is inferred from the count or order status. Context reads do not contact PACS. Availability monitoring and ingestion jobs remain separate work.

Clinical search terms stay in POST bodies and transient query state; they are not placed in navigation URLs, browser persistence or audit reasons. Search/detail audit events record actor, facility/entity and action without copying the term. Hosting must also keep request-body logging disabled.

## Query and deployment limits

Search uses EF-translated predicates, bounded page projections and batch queries for patients, original report summaries and link counts; it avoids a per-row request loop. Existing tenant/facility/status indexes are preserved. Name/identifier substring searches use database lower/contains semantics and are **not full-text indexed search**. Production volumes require query-plan measurements and a separately reviewed PostgreSQL search/index strategy. Unicode case and accent behavior depends on database collation; accent folding is not promised.

No application database migration or new seed data is required for this increment. Start backend and frontend using the foundation local-run guide. Existing synthetic demo data still resets on browser reload. Database migrations in verification run only against newly created disposable test databases.

## Verification and next work

Local verification completed 30 October 2026:

| Check                         | Result                                                                                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend unit/component suite | 29 passed, including retained patient selection after search changes.                                                                                                                     |
| Backend ordinary suite        | 60 passed, including search boundaries, authorization masking, linked/scheduled/report-created token refresh and nullable OpenAPI references.                                             |
| PostgreSQL 17 suite           | 4 passed, including real-provider search projections beyond 100 patients and the existing claim/schedule/sign races.                                                                      |
| Synthetic demo browser suite  | 6 Chromium scenarios passed, including axe, mobile read-only review and order registration.                                                                                               |
| Actual API/browser suite      | 4 Chromium scenarios passed: reporting through signature/export, dirty-text conflict recovery, filtering across worklist pages and retained selection/order creation beyond 100 patients. |
| Build / lint / formatting     | Passed. Dashboard screenshot reviewed.                                                                                                                                                    |
| Contracts                     | Backend snapshot comparison and generated TypeScript checks passed; nullable patient/original-report references are represented correctly.                                                |
| Original source documents     | All eight SHA256 hashes match.                                                                                                                                                            |
| Test cleanup                  | Owned test databases dropped and owned clusters stopped; pre-existing PostgreSQL service remains running.                                                                                 |

The component test harness supplies jsdom's missing dialog open state; native modal/focus behavior remains covered by Chromium. Existing React Router and NO_COLOR warnings are non-failing. No production schema changes, deployment or persistent PowerShell policy changes were made.

Run `npm.cmd run test:integration` for backend, PostgreSQL and actual API/browser tests; `npm.cmd run test:e2e` for the synthetic demo and axe checks. Normal build, lint, formatting and contract drift checks remain required.

The next planned increment is **M05 reporting schema/provenance and conflict comparison**. Agree indication/technique fields, versioned source attribution and signed-content digest compatibility before altering signed report content. Separate autosave draft semantics also remain a decision. Institution OIDC/BFF configuration remains an M02 release dependency. Diagnostic viewer, upload/extraction, saved views, ingestion lifecycle and durable analytics events remain outstanding; M04 does not claim those features.
