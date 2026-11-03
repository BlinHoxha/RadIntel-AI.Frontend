# M05A: conflict review and signature compatibility

30 October 2026. Status: M05A implemented and locally verified. M05B remains pending.

Scope: side-by-side local/server report comparison after 409, explicit section-level reconciliation, failed-fetch safety, signed-report locking and pinned legacy digest regression fixtures. Existing API bodies, report fields, database schema, signature algorithm and explicit-save semantics remain unchanged. This is the first bounded M05 increment, not completion of report-schema/provenance work.

The current legacy digest is SHA-256 over UTF-8 encoding of .NET UTF-16-length-prefixed examination/findings/impression/language. Future fields require a separately versioned compatibility contract; old signatures must remain verifiable.

M05B remains pending: indication/technique requiredness, limits and legacy behavior; section/source attribution; versioned digest and migration design. The owner approved optional indication/technique fields on 30 October 2026, preserving existing reports. No application migration or new clinical semantics are introduced by M05A.

## Checkpoints

- Batch 1: reviewed current domain/API/editor and historical verification; implementation has not yet been validated.

See [session handoff](context/SESSION_HANDOFF.md) and [implementation status](context/IMPLEMENTATION_STATUS.md).

- Batch 2: comparison component/editor guards and independent pinned legacy digest fixtures added; validation pending.

- Batch 3: optional fields approved for M05B; comparison protects assistance too; real-API conflict scenario now requires explicit reconciliation. Initial new component type errors corrected; validation pending.

- Batch 4: backend suite 64 passed; browser regressions added for transport failure/repeated conflict/replacement/signed locking. Browser validation pending.

## Delivered behavior

After a 409, the editor retains local text and keeps draft saves, submission/signing and assistance blocked. Reloading fetches the server revision for side-by-side comparison; it does not resolve the conflict or save anything. Each section can be explicitly copied from the server into the local editor. Continue with my reviewed text acknowledges the comparison and enables the next explicit save using the loaded token. Replace my unsaved text with server revision deliberately discards local text and clears dirty state without creating a revision.

Comparison includes examination, findings, impression and report language, plus the saved revision author. These are existing revision metadata, not new per-field provenance. A failed reload preserves the editor and blocks reconciliation. A later server edit causes another 409. A signed server report blocks merging/overwriting; its original saved content and signature remain unchanged. Narrow-screen conflict controls follow the existing read-only policy.

Backend production code, report content, API/DTO shape, digest algorithm and database schema are unchanged. Four new backend cases pin independently computed legacy digest fixtures (ASCII, Albanian, supplementary Unicode and newline) and persisted signature/original-version integrity after creating an addendum.

## Verification completed 30 October 2026

| Check                                         | Result                                                                        |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Backend ordinary suite                        | 64 passed, zero failed/skipped                                                |
| Frontend unit/component suite                 | 34 passed, zero failed/skipped                                                |
| Production build / strict types               | Passed                                                                        |
| Lint                                          | Passed                                                                        |
| Demo Chromium suite                           | 6 passed, including existing dashboard axe scan                               |
| Actual API/PostgreSQL Chromium suite          | 6 passed                                                                      |
| Dedicated PostgreSQL concurrency/search suite | Previous M04 result: 4 passed; unchanged suite not rerun for M05A             |
| Formatting / generated contracts              | Passed: Prettier, generated TypeScript and offline backend OpenAPI comparison |

The real-API scenarios cover existing reporting/sign/export and M04 search/picker flows, explicit section reconciliation and retained local text, failed comparison GET, a second concurrent edit, explicit replacement without new persistence, mobile read-only controls and a report signed by another session. The failure case intercepts only the browser's comparison GET with a synthetic 503; normal reads/writes/signing use the actual API/database.

The integration runner created/migrated only a new disposable synthetic database on its owned temporary loopback PostgreSQL instance, then dropped the database and stopped that instance. No application database/schema was migrated, installed service was changed, credentials/policy settings were altered, or Git refs were moved. Hosted CI, live IdP/PACS and clinical acceptance remain unverified.

An initial new-component type-check failure was corrected. An unprivileged Vite build could not traverse parent directories; the authorized outside-sandbox build/test run passed. Existing React Router and NO_COLOR messages remain non-failing.

Visual reference: [synthetic conflict screen](../artifacts/report-conflict.png), generated during actual API verification and visually inspected. The ignored artifact may be absent in another checkout.

## Changed files

Frontend:

- src/features/reports/ReportConflictReview.tsx and its component tests.
- src/features/reports/StudyWorkspace.tsx: comparison state, explicit decisions, failed-fetch retention and command guards.
- src/features/ai/Assistance.tsx: blocks assistance while a report conflict is unresolved.
- src/app/styles.css: responsive comparison layout.
- e2e-api/workflow.spec.ts: section reconciliation and two additional real-API scenarios.

Backend:

- tests/RadIntel.Tests/SignatureCompatibilityTests.cs only; no production/schema changes.

All four docs/context documents are maintained with every coherent implementation/test change, including in-progress results and unresolved work. Existing M04/foundation records remain dated evidence.

## Next bounded increment: M05B

Owner decision: indication and technique will be optional; existing reports remain valid. This decision is accepted and must not be asked again as an unresolved requiredness choice.

Next work is a concrete versioned report contract and implementation for those fields plus immutable source attribution. Define field limits/null semantics, source identifiers/edit lineage, a new content/digest version for new-schema revisions, an unchanged legacy verification path, and an additive migration that never rewrites signed content. Agree/record the engineering design before editing signature semantics, regenerate API/types, then update editor/history/export and compatibility tests. Do not introduce autosave or silently copy order referral into signed indication.

- Final checkpoint: all original source hashes and handoff links verified, git whitespace check passed, branch/HEAD/staging unchanged, installed PostgreSQL service Running. All four handoff documents synchronized.
