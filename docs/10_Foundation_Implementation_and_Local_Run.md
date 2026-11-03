# Foundation implementation and connected local run

29 October 2026 | First implementation batch following the v2 assessment

## Delivered scope

This increment implements the first approved batch from [the v2 assessment](09_V2_Gap_Assessment_and_Implementation_Plan.md): A01 contract verification/generation, A02 mock alignment/formatting, M01 local React/API authentication and M03 disposable-PostgreSQL integration checks/CI. The assessment remains a dated baseline; its earlier statement that these tickets were unstarted is historical.

| Ticket | Delivery status                  | Remaining boundary                                                                                                    |
| ------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| A01    | Implemented and locally verified | Review schema/type changes when future endpoints change; no generated fetch client/runtime JSON validator is claimed. |
| A02    | Implemented and locally verified | Mocks are scenario aids; actual API tests remain authoritative.                                                       |
| M01    | Implemented and locally verified | Institutional OIDC/BFF remains M02; application database preparation is explicitly manual.                            |
| M03    | Implemented and locally verified | Remote CI execution still requires compatible sibling branches/read permissions; no remote run was triggered.         |

- Explicit response envelopes preserve the backend's existing JSON member names while documenting session, report detail, metrics and review results. Created responses, nullable fields, enums, record-constructor validation metadata, errors and signed-text downloads are represented in OpenAPI. No report schema/digest or clinical transition was changed.
- The schema-only `RadIntel.OpenApi` tool shares API registration with the actual host. It does not start the application, listen on a port or contact a database. The frontend stores a reviewed snapshot and generated TypeScript types, with drift checks.
- React's development identity fields require an explicit opt-in, loopback Vite development mode and the backend's Development capability response. Roles are never supplied by the browser. Simulated MFA needs the existing explicit backend opt-in. JWT-only sessions and production builds do not attach development identity headers.
- Demo templates match modality/body region/language. Proposals preserve checked text verbatim, reject stale/revoked/replaced sources, and require explicit acceptance. Signature keys cannot replay onto another report. Existing synthetic and manual workflows remain available.
- Backend HTTP contract tests exercise the real Development authentication handler with a test-only loopback transport. Dedicated PostgreSQL tests exercise migrations/replay and concurrent claims, equipment booking/rescheduling, signing/idempotency and outbox atomicity. Real browser tests use the running API and PostgreSQL, not MSW.
- The local demo initializer uses authorized API calls only, requires explicit `-Apply` and a loopback Development API, preserves existing cases, defaults to unpublished synthetic templates, and never signs a report or applies schema.

Institution OIDC/BFF setup (M02), server search/context improvements (M04), report-schema/provenance changes (M05), full viewer and document extraction remain later work. This increment does not enable clinical AI or patient-facing release.

## Run the populated UI without a database

```powershell
cd C:\Users\blinh\source\repos\RadIntel-AI.Frontend
npm.cmd ci
npm.cmd run dev
```

With demo mode left at its default, open Vite's printed local URL and select **Explore demo workspace**. All data is synthetic and resets on reload. Set `VITE_DEMO_MODE=true` if an existing `.env.local` previously selected API mode.

## Run React against your local backend and database

Prerequisites: the backend SDK selected by `RadIntel-AI/global.json`, Node/npm, PostgreSQL with the prepared product schema applied, and sibling Framework/AI-Framework checkouts. These application-database steps are manual; `dotnet run` and the initializer never migrate an application database. The integration runner below uses its own temporary databases instead.

In backend terminal 1, set the connection to your intended local development database (replace the sample password), generate a private token, and keep the organization UUID stable between runs:

```powershell
cd C:\Users\blinh\source\repos\RadIntel-AI
$env:ConnectionStrings__DefaultConnection = 'Host=localhost;Port=5432;Database=radintel;Username=radintel;Password=YOUR_LOCAL_PASSWORD'
$env:Authentication__Mode = 'Development'
$env:Authentication__DevelopmentToken = [guid]::NewGuid().ToString('N')
$env:Authentication__AllowDevelopmentProvisioning = 'true'
$env:Authentication__AllowSimulatedMfa = 'true'
$env:AI__DraftProvider = 'Verbatim'
$env:AI__KnowledgeProvider = 'Local'
$env:Authentication__DevelopmentToken
dotnet run --project src/RadIntel.Api --launch-profile http
```

Copy the token displayed before starting. The API listens on `http://localhost:5300`. `GET /health/ready` must return 200; 503 means the database cannot be reached or prepared migrations are pending. Apply `deploy/sql/001_InitialRadiology.sql` then `002_PacsStudyLinks.sql` and `003_VersionedReportContent.sql` to the intended development database if they have not already been applied; this guide does not execute them.

In backend terminal 2, preview and then explicitly create synthetic cases. Supply the same private token without committing it to a file. The commands below use an explicit process-only signing-policy exception for this reviewed local script; use an approved signed copy instead where that is required. Machine-wide policy is unchanged:

```powershell
cd C:\Users\blinh\source\repos\RadIntel-AI
$privateToken = Read-Host 'Paste the private local token' -AsSecureString
$env:Authentication__DevelopmentToken = [System.Net.NetworkCredential]::new('', $privateToken).Password
Remove-Variable privateToken
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Initialize-LocalDemo.ps1 -OrganizationId '11111111-1111-4111-8111-111111111111'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Initialize-LocalDemo.ps1 -OrganizationId '11111111-1111-4111-8111-111111111111' -Apply -PublishSyntheticTemplates
```

Use `-UserId` if you want another local identity; default is `local-radiologist`. If the organization already exists under another identity, use that identity or have an administrator grant membership. The script cannot bypass membership or take over an existing organization. `-FacilityId` selects a specific authorized facility. Repeating setup preserves existing patient/orders, including partially completed cases after an interrupted first run; it does not reset them. `-PublishSyntheticTemplates` explicitly publishes only the initializer's synthetic structures for local Verbatim testing; omit it to leave newly created templates unpublished.

In the frontend folder, create `.env.local` with:

```dotenv
VITE_DEMO_MODE=false
VITE_ENABLE_DEVELOPMENT_AUTH=true
RADINTEL_API_TARGET=http://localhost:5300
```

Then:

```powershell
cd C:\Users\blinh\source\repos\RadIntel-AI.Frontend
npm.cmd ci
npm.cmd run dev
```

Open `http://127.0.0.1:5173` (or the printed port), enter the private token, `local-radiologist`, and the same organization UUID. Check local simulated MFA only when testing signing. React now shows the database's synthetic facility, three patient/order cases, one unsigned MR draft and matching templates. Acquired CT is ready to claim; XR remains requested for staff workflow testing. Existing data may reflect your previous actions.

Keep both application terminals running. Restart Vite after changing `.env.local`. JWT deployments leave `VITE_ENABLE_DEVELOPMENT_AUTH=false` and use their actual identity provider; an institution login/BFF has not been implemented. All tokens stay in browser memory. No development credentials or MFA simulation should be used for a public or clinical deployment.

## Regenerate and verify contracts

The snapshot covers controller routes (including `/client-config`), not the host's operational health endpoints. Bearer requirements are explicit for protected operations; the configuration endpoint is anonymous.

From the backend, pass an **absolute** snapshot path because `dotnet run` uses the tool project directory:

```powershell
cd C:\Users\blinh\source\repos\RadIntel-AI
dotnet run --project tools/RadIntel.OpenApi -- C:\Users\blinh\source\repos\RadIntel-AI.Frontend\api\openapi.json
# Check instead of overwriting:
dotnet run --project tools/RadIntel.OpenApi -- C:\Users\blinh\source\repos\RadIntel-AI.Frontend\api\openapi.json --check
```

Then in the frontend:

```powershell
npm.cmd run contracts:generate
npm.cmd run contracts:check
npm.cmd run typecheck
```

Review both schema and generated changes when changing an API. Generated files are excluded from manual formatting/lint fixes. UI projections preserve the local clinical editor's language validation while taking field/enumeration types from generated wire models; this is not a runtime validator for arbitrary JSON or a generated fetch client.

## Run actual PostgreSQL/API/browser checks

```powershell
cd C:\Users\blinh\source\repos\RadIntel-AI.Frontend
npx.cmd playwright install chromium
npm.cmd run test:integration
```

On Windows the runner uses the installed PostgreSQL 17 server binaries at `C:\Program Files\PostgreSQL\17\bin`; override `RADINTEL_PG_BIN` for another installation. It initializes a separate cluster under backend `.artifacts/integration/<unique-run>/`, binds only loopback on an available port, uses random credentials, and removes the temporary password file. It does not stop, reconfigure or reuse the installed PostgreSQL service.

The runner applies EF migrations only to new random `radintel_test_<32 hex>` databases, runs the backend suites, starts a real API against a separately migrated test database, and runs the dedicated API browser scenarios. On Windows, set `RADINTEL_VERIFY_LOCAL_SETUP=true` to also run local demo initialization twice and verify that exactly three synthetic cases remain. Normal completion or test failure runs database cleanup and stops the owned instance. Ignored cluster/log artifacts remain for diagnosis; they contain only this synthetic test environment. Do not point the runner at an application database.

This machine's LocalMachine PowerShell policy is AllSigned. New unsigned `.ps1` files need an approved signature or an explicit process-only exception. The runner does not change machine/user policy. For a deliberate local smoke test of this repository's initializer, run `npm.cmd run test:integration -- --verify-local-setup --allow-unsigned-local-setup`. The last flag adds `-ExecutionPolicy Bypass` only to that child PowerShell invocation. Alternatively set the equivalent `RADINTEL_VERIFY_LOCAL_SETUP` and `RADINTEL_ALLOW_UNSIGNED_LOCAL_SETUP` environment variables to `true`. Leave the exception unset to respect the signing policy. For manual use, choose the same process-only exception explicitly or use an approved signed copy; do not weaken machine-wide policy. Use `npm.cmd` rather than `npm` when AllSigned also blocks the installed `npm.ps1` shim.

For CI or an explicitly isolated existing PostgreSQL service, set `RADINTEL_TEST_POSTGRES_ADMIN` to a **loopback** admin connection with `Database=postgres`; creation privileges are needed. The runner does not read the application's DefaultConnection. Remote admin hosts and application database names are rejected. The dedicated PostgreSQL test project is outside the default solution run; invoking it without explicit test configuration fails rather than silently passing skipped tests.

The browser/API test credentials are generated per run and passed through child-process environment, not command-line arguments, committed config or browser storage. The real API test host uses no test authentication scheme. The in-memory HTTP test factory overrides the connection IP only inside the test project; it is not shipped by the application.

## CI and remaining environment requirements

The frontend workflow includes its ordinary build/test checks plus an API-integration job that checks out all four sibling repositories, verifies schema/type drift, and runs actual API/PostgreSQL/browser scenarios. The backend workflow runs its ordinary and PostgreSQL suites. Both use isolated PostgreSQL service containers and synthetic databases.

Configure `RADINTEL_BACKEND_REPOSITORY`, `FRAMEWORK_REPOSITORY`, `AI_FRAMEWORK_REPOSITORY` and their corresponding `*_REF` repository variables when names/branches differ from the defaults. Private sibling checkouts require a read-only `RADINTEL_REPOSITORY_TOKEN` secret with access to those repositories. Publish compatible backend/frontend changes before expecting cross-repository checks to pass. Workflow files are prepared locally; no remote workflow run, commit, push or deployment was performed here.

The previous screenshot capture helper is now formatted. Dependency scanning remains a separate release check and no current clean vulnerability-audit result is claimed by this document.

## Verification record

| Check                              | Local result                                                                                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend build / strict type check | Passed.                                                                                                                                                                                                           |
| Frontend unit/component tests      | 28 passed. Includes local authentication guards, request redaction/no retry, permissions, proposal matching, stale/revoked sources and signature-key scope.                                                       |
| Backend ordinary suite             | 57 passed, including real Development authentication, HTTP contracts, schema auth/nullability/errors/download metadata and disposable-database safety guards.                                                     |
| PostgreSQL suite                   | 3 passed against PostgreSQL 17: migration/replay, competing claim, overlapping booking/rescheduling and concurrent signature/idempotency/outbox scenarios.                                                        |
| Existing demo browser suite        | 6 Chromium scenarios passed, including the dashboard axe scan and mobile read-only behavior.                                                                                                                      |
| Actual API/browser suite           | 2 Chromium scenarios passed against a real API/PostgreSQL database: manual/Verbatim draft through signature/export and two-editor conflict recovery. Both editors explicitly wait for the same starting revision. |
| Synthetic setup replay             | Passed twice on the same isolated tenant: exactly three patients/orders and one unsigned MR draft revision preserved. Child-process exception explicitly opted in; machine AllSigned policy unchanged.            |
| API snapshot and generated types   | Backend snapshot comparison and TypeScript generation checks passed.                                                                                                                                              |
| Original document preservation     | All eight baseline/v2 source hashes verified unchanged.                                                                                                                                                           |
| Cleanup                            | Owned test databases dropped and temporary PostgreSQL instance stopped; the pre-existing PostgreSQL 17 service remains running.                                                                                   |

The Node 24/JSDOM test harness uses Node's native AbortController/AbortSignal pair for fetch/router compatibility; application browser code is unchanged by this harness adjustment. The existing React Router future-flag warning is non-failing. Lint and formatting gates are checked separately and the earlier capture-helper formatting issue is corrected. No live PACS, external identity provider, clinical model or real patient records were used. No deployment, commit/push, application schema migration or persistent PowerShell policy change was performed.

Next engineering increment: M04 server-side search, authoritative patient/study context and refreshed command tokens. M02 institution login design requires the selected identity provider/session approach. M05 report-schema changes still require the recorded content/digest compatibility decisions. Viewer/extraction and Phase 3 gates remain as assessed.

Subsequent increment: [M04 implementation record](11_M04_Server_Search_and_Order_Context.md) supersedes the next-increment note above; this foundation verification table remains a historical snapshot.

Current follow-up: [M05B](13_M05B_Versioned_Content_and_Provenance.md) adds optional fields/provenance and a third additive migration. Apply SQL 003 deliberately before connecting the schema-2 client; this document does not execute application migrations. Earlier increment counts above remain historical.
