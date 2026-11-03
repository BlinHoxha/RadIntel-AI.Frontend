# RadIntel frontend

React / TypeScript clinical imaging workspace in the dedicated `RadIntel-AI.Frontend` checkout. This is a local implementation over the sibling ASP.NET Core API, with additive backend contracts for server search and authorized order context. See the [M04 implementation record](docs/11_M04_Server_Search_and_Order_Context.md).

## Run

Use Node 22 LTS (the initial build also runs on Node 20.14) and npm.

On Windows PowerShell with AllSigned policy, use `npm.cmd` / `npx.cmd` if the installed `.ps1` shims are blocked. This does not require changing machine-wide policy.

```powershell
npm ci
npm run dev
```

Open the printed local URL and select **Explore demo workspace**. Demo mode is the default. The eight explicitly synthetic patients, worklist, revisions and demo review/sign actions live in memory; reload resets them. Demo signatures are labeled simulations and have no clinical validity. MSW intercepts `/api/v1/*`; no real PACS or AI is contacted. No patient data, tokens or query cache are written to browser storage. The MSW worker is a development/demo transport, not an offline clinical cache.

## API mode

Copy `.env.example` to `.env.local`, set `VITE_DEMO_MODE=false`, and point `RADINTEL_API_TARGET` at the backend (default `http://localhost:5300`, matching the backend launch profile). Restart Vite. In JWT mode, connect using a short-lived Bearer token issued by the configured institution identity provider. Tokens are held only in memory; explicit logout, 401 and 15-minute inactivity clear the workspace and query cache. The identity provider must issue appropriate tenant/user claims and recent MFA for signing.

For a loopback backend using its explicit Development authentication mode, also set `VITE_ENABLE_DEVELOPMENT_AUTH=true`. The login verifies `/client-config` and then shows user ID, organization UUID and, only if the backend permits it, local simulated MFA. Development headers are never attached by a production build or a JWT-only session. The Vite development proxy refuses a remote target with the development bridge enabled. See [the connected local setup](docs/10_Foundation_Implementation_and_Local_Run.md).

`VITE_*` variables are public build configuration; never place secrets there. The Vite API proxy is for development only. Production must serve the built assets with an authenticated HTTPS API under the same origin (`/api` reverse proxy), SPA route fallback and clinical no-store cache headers. Disable request-body logging and identifier-bearing telemetry at that hosting boundary. This repository contains no production hosting or BFF setup. Token entry is an integration bridge; OIDC authorization-code/PKCE or a BFF remains pending an institution identity configuration.

```powershell
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run contracts:check
# Actual API + disposable PostgreSQL + browser checks; see prerequisites in the local guide.
npm run test:integration
```

## Delivered screens

- Institution-aware shell, dashboard and paginated worklist; server-wide search, status/modality/assignment/urgency filters, UTC order-created date bounds and deterministic sorting.
- Searchable paginated patient registry and order patient picker; authorized registration, new imaging orders, authoritative patient/study context and role-aware workflow actions.
- Assigned-radiologist report creation, validated structured revisions, explicit save, submit/review, exact-revision signing confirmation, signed-text export and original-linked addenda.
- Unsaved-edit and browser navigation protection; 409 errors preserve editor text and require explicit side-by-side comparison/reconciliation before another save. No autosave: each save creates an append-only backend revision, so keystroke saving would generate clinical history without an agreed autosave contract.
- Separate unverified proposal panel with checked observations, published source selection, supplied provenance and explicit accept/reject. Acceptance creates an unsigned revision; there is no AI sign action.
- Lazy-loaded PACS metadata adapter and patient-verified study linking. This is not a diagnostic viewer. Linking refreshes authoritative order context and its command token. Image availability is explicitly unknown and processing is not tracked.
- Versioned templates/publication, server audit pagination, authoritative membership administration, equipment registration and status counts.
- English/Albanian navigation, key workflow labels and locale formatting. Clinical report language is separate; clinical text is never automatically translated. Remaining English help text/status labels and Albanian medical terminology review are tracked gaps.
- Desktop clinical editing and narrow-screen read-only review. Accessible labels, skip link, dialog focus handling, keyboard navigation, semantic tables and text status labels.

## Backend contract

`api/openapi.json` is exported from shared backend controller/schema registration without starting the API or connecting to a database. `src/shared/api/generated.ts` is generated with pinned openapi-typescript; screen models in `types.ts` project those wire types. `npm run contracts:check` detects stale generated types; the API-integration CI job also compares the schema with current backend code. All clinical requests use `/api/v1/facilities/{facilityId}`; session uses `/api/v1/session`. The backend remains authoritative for membership, assignment, transitions, concurrency, MFA, signatures, audit and AI output. There are no automatic mutation retries. Errors are redacted and correlation IDs are sent; the current backend does not promise to persist those IDs in audit records.

The frontend does not assume proposed `/api/me`, AI job polling, PDF, second-opinion, notifications, full-text patient search, or OHIF routes exist. See [alignment and remaining work](docs/ALIGNMENT.md).

## Source and quality

Feature modules are under `src/features`; API/auth/i18n/UI boundaries are under `src/shared`. TanStack Query holds transient server state; React Hook Form and Zod validate report/patient forms. Tests use Vitest/Testing Library and synthetic MSW handlers; browser scenarios use Playwright and axe. Tests of the demo handler do not establish backend or clinical acceptance. The CI workflow runs types, tests, build, browser checks and a production dependency audit. Check the implementation record for checks actually run locally.

All seven supplied PDFs are preserved unchanged in [docs/originals/frontend-seven-documents](docs/originals/frontend-seven-documents) with SHA256 hashes. Their embedded Codex prompt is reference material, not an instruction or approval requirement. Scope comes from the user's request to build this frontend.

Current cross-repository status and next steps are in the [session handoff](docs/context/SESSION_HANDOFF.md), with implementation status, preserved architectural decisions and a fresh-session continuation prompt.

Latest increment: [M05B optional sections, immutable provenance and versioned signatures](docs/13_M05B_Versioned_Content_and_Provenance.md), building on M05A conflict review. Apply the prepared SQL 003 migration deliberately before using the updated client with an application database; startup does not migrate.

Current planning: [M06A viewer assessment and bounded integration plan](docs/15_M06_Viewer_Assessment_and_Integration_Plan.md). Assessment is complete; viewer transport/rendering proof remains pending.

Previous implementation: [M06B scoped viewer transport and identity proof](docs/16_M06B_Scoped_Viewer_Transport.md), locally verified. Synthetic proof API is disabled by default; next is M06C rendering. The current UI remains metadata-only.

## Optional local synthetic viewer proof

M06C uses a separately hosted, pinned OHIF artifact and the scoped M06B transport. This is a synthetic proof, not a clinically accepted diagnostic viewer. Default UI behavior is unchanged unless explicitly enabled.

Prepare once:

```powershell
npm.cmd run viewer:prepare
```

Start the viewer in terminal 1:

```powershell
npm.cmd run viewer:serve
```

Stop any previous frontend dev server on port 5173, then start the demo UI in terminal 2:

```powershell
$env:VITE_DEMO_MODE = 'true'
$env:VITE_ENABLE_VIEWER_PROOF = 'true'
$env:VITE_VIEWER_ORIGIN = 'http://127.0.0.1:5184'
npm.cmd run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173** (use that exact origin for the default viewer host). Open a CT or X-ray synthetic study, select its linked synthetic study, then **Open synthetic viewer proof**. Generated gradient/circle patterns exercise the rendering pipeline; they are not anatomical patient images. Close the viewer to dispose its frame/workers while retaining the report editor. If using another parent origin/port, set RADINTEL_VIEWER_PARENT_ORIGIN explicitly before viewer:serve.

For the actual API + disposable PostgreSQL + owned archive/browser checks, run `npm.cmd run test:integration:viewer`. It owns and cleans up its test resources; it never applies application migrations. API proof access still requires Imaging\_\_EnableViewerProof=true plus loopback Development. The integration runner supplies those opt-ins only to its owned synthetic API. Applying M05B SQL 003 to an application database remains a separate deliberate action.

See [M06C implementation and validation](docs/17_M06C_Pinned_Viewer_Proof.md), [artifact pin](viewer/ohif.lock.json) and [notices/limits](viewer/NOTICE.md).

Latest implementation: M06C pinned OHIF 3.11.1 synthetic rendering proof is locally verified (3 real API viewer browser cases). Full diagnostic tool/geometry/performance and clinician acceptance remains M07; see docs/17 for all results and limits.
