import { spawn } from 'node:child_process';
import { startViewerServer } from './serve-viewer.mjs';
import { startSyntheticArchive } from './synthetic-archive.mjs';
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const backend = resolve(
  process.env.RADINTEL_BACKEND_ROOT ||
    fileURLToPath(new URL('../../RadIntel-AI/', import.meta.url)),
);
const artifacts = join(backend, '.artifacts', 'integration', randomUUID());
const database = 'radintel_test_' + randomUUID().replaceAll('-', '');
let admin = process.env.RADINTEL_TEST_POSTGRES_ADMIN;
let pgBin, pgData, api;
let clusterStarted = false,
  databaseCreated = false;
const runtime = { ...process.env };
const browserOnly = process.argv.includes('--browser-only');
const viewerProof = process.argv.includes('--viewer');
let viewerHost, syntheticArchive;
const verifyLocalSetup =
  process.argv.includes('--verify-local-setup') ||
  process.env.RADINTEL_VERIFY_LOCAL_SETUP === 'true';
const allowUnsignedLocalSetup =
  process.argv.includes('--allow-unsigned-local-setup') ||
  process.env.RADINTEL_ALLOW_UNSIGNED_LOCAL_SETUP === 'true';

function launch(command, args, cwd, env = runtime) {
  const child = spawn(command, args, {
    cwd,
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => {
    output = (output + data).slice(-18000);
  });
  child.stderr.on('data', (data) => {
    output = (output + data).slice(-18000);
  });
  child.on('error', (error) => {
    output += error.message;
  });
  child.output = () => output;
  return child;
}
async function run(command, args, cwd, env = runtime) {
  const child = launch(command, args, cwd, env);
  const code = await new Promise((done, fail) => {
    child.once('exit', done);
    child.once('error', fail);
  });
  if (code !== 0) throw new Error(`${command} failed (${code}).\n${child.output()}`);
  if (child.output().trim()) console.log(child.output().trim());
}
async function port() {
  const server = createServer();
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', done);
  });
  const value = server.address().port;
  await new Promise((done) => server.close(done));
  return value;
}
async function stop(child) {
  if (!child || child.exitCode !== null) return;
  const exited = new Promise((done) => child.once('exit', done));
  child.kill();
  await exited;
}
async function waitForApi(url) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (api.exitCode !== null) throw new Error(`Isolated API exited.\n${api.output()}`);
    try {
      if ((await fetch(`${url}/health/ready`)).ok) return;
    } catch {
      /* Starting. */
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error('Isolated API did not become ready.');
}
try {
  await access(join(backend, 'RadIntel-AI.sln'));
  if (!admin) {
    if (process.platform !== 'win32' && !process.env.RADINTEL_PG_BIN)
      throw new Error(
        'Set RADINTEL_TEST_POSTGRES_ADMIN for an isolated loopback PostgreSQL service, or RADINTEL_PG_BIN for local server binaries.',
      );
    pgBin = process.env.RADINTEL_PG_BIN || 'C:\\Program Files\\PostgreSQL\\17\\bin';
    const exe = (name) => join(pgBin, name + (process.platform === 'win32' ? '.exe' : ''));
    await access(exe('initdb'));
    await mkdir(artifacts, { recursive: true });
    pgData = join(artifacts, 'postgres');
    const password = randomBytes(24).toString('hex');
    const passwordFile = join(artifacts, 'initdb-password');
    await writeFile(passwordFile, password + '\n', { mode: 0o600 });
    try {
      await run(
        exe('initdb'),
        [
          '-D',
          pgData,
          '-U',
          'radintel_test_admin',
          '--auth-host=scram-sha-256',
          '--auth-local=scram-sha-256',
          '--pwfile',
          passwordFile,
          '--encoding=UTF8',
          '--locale=C',
        ],
        backend,
      );
    } finally {
      await unlink(passwordFile);
    }
    const pgPort = await port();
    await run(
      exe('pg_ctl'),
      [
        'start',
        '-D',
        pgData,
        '-l',
        join(artifacts, 'postgres.log'),
        '-w',
        '-o',
        `-h 127.0.0.1 -p ${pgPort}`,
      ],
      backend,
    );
    clusterStarted = true;
    admin = `Host=127.0.0.1;Port=${pgPort};Database=postgres;Username=radintel_test_admin;Password=${password};Pooling=false`;
    console.log(
      'Started a separate loopback PostgreSQL instance; existing services are untouched.',
    );
  }
  runtime.RADINTEL_TEST_POSTGRES_ADMIN = admin;
  if (!browserOnly) {
    console.log('Running backend HTTP contracts and isolated PostgreSQL concurrency tests.');
    await run(
      'dotnet',
      ['test', 'tests/RadIntel.Tests/RadIntel.Tests.csproj', '-c', 'Release'],
      backend,
    );
    await run(
      'dotnet',
      ['test', 'tests/RadIntel.PostgreSql.Tests/RadIntel.PostgreSql.Tests.csproj', '-c', 'Release'],
      backend,
    );
  } else console.log('Backend suites not requested (--browser-only); running API/browser checks.');
  await run(
    'dotnet',
    ['build', 'tools/RadIntel.TestDatabase/RadIntel.TestDatabase.csproj', '-c', 'Release'],
    backend,
  );
  const databaseTool = join(
    backend,
    'tools',
    'RadIntel.TestDatabase',
    'bin',
    'Release',
    'net9.0',
    'RadIntel.TestDatabase.dll',
  );
  await run('dotnet', [databaseTool, 'create', database], backend);
  databaseCreated = true;
  const apiPort = await port();
  const apiUrl = `http://127.0.0.1:${apiPort}`;
  const token = randomBytes(32).toString('hex');
  const apiEnvironment = {
    ...runtime,
    ASPNETCORE_ENVIRONMENT: 'Development',
    ASPNETCORE_URLS: apiUrl,
    ConnectionStrings__DefaultConnection: admin.replace(
      /(^|;)Database=postgres(?=;|$)/i,
      `$1Database=${database}`,
    ),
    Authentication__Mode: 'Development',
    Authentication__DevelopmentToken: token,
    Authentication__AllowDevelopmentProvisioning: 'true',
    Authentication__AllowSimulatedMfa: 'true',
    AI__DraftProvider: 'Verbatim',
    AI__KnowledgeProvider: 'Local',
  };
  if (apiEnvironment.ConnectionStrings__DefaultConnection === admin)
    throw new Error(
      'The explicit admin connection must contain Database=postgres; refusing to start an API on an admin database.',
    );
  api = launch(
    'dotnet',
    [join(backend, 'src', 'RadIntel.Api', 'bin', 'Release', 'net9.0', 'RadIntel.Api.dll')],
    join(backend, 'src', 'RadIntel.Api'),
    apiEnvironment,
  );
  await waitForApi(apiUrl);
  let viewerTenant, viewerFacility;
  if (viewerProof) {
    viewerTenant = randomUUID();
    const response = await fetch(apiUrl + '/api/v1/organizations/onboard', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'X-RadIntel-Tenant': viewerTenant,
        'X-RadIntel-User': 'viewer-proof-owner',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationName: 'Synthetic Viewer Proof',
        facilityName: 'Synthetic Viewer Facility',
        timeZone: 'UTC',
      }),
    });
    if (!response.ok) throw new Error('Synthetic viewer onboarding failed.');
    viewerFacility = (await response.json()).facilityId;
    await stop(api);
    syntheticArchive = await startSyntheticArchive();
    Object.assign(apiEnvironment, {
      Imaging__EnableViewerProof: 'true',
      Pacs__Archives__0__Key: 'proof',
      Pacs__Archives__0__Name: 'Owned synthetic viewer archive',
      Pacs__Archives__0__OrganizationId: viewerTenant,
      Pacs__Archives__0__FacilityId: viewerFacility,
      Pacs__Archives__0__Endpoint: syntheticArchive.origin + '/',
      Pacs__Archives__0__AllowAnonymousDevelopment: 'true',
    });
    api = launch(
      'dotnet',
      [join(backend, 'src', 'RadIntel.Api', 'bin', 'Release', 'net9.0', 'RadIntel.Api.dll')],
      join(backend, 'src', 'RadIntel.Api'),
      apiEnvironment,
    );
    await waitForApi(apiUrl);
    viewerHost = await startViewerServer({ port: 0, parentOrigin: 'http://127.0.0.1:5192' });
  }

  if (process.platform === 'win32' && verifyLocalSetup) {
    const setupTenant = randomUUID();
    const setupArgs = [
      '-NoProfile',
      ...(allowUnsignedLocalSetup ? ['-ExecutionPolicy', 'Bypass'] : []),
      '-File',
      join(backend, 'scripts', 'Initialize-LocalDemo.ps1'),
      '-BaseUri',
      apiUrl,
      '-OrganizationId',
      setupTenant,
      '-UserId',
      'synthetic-setup-owner',
      '-Apply',
      '-PublishSyntheticTemplates',
    ];
    await run('powershell.exe', setupArgs, backend, apiEnvironment);
    await run('powershell.exe', setupArgs, backend, apiEnvironment);
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-RadIntel-User': 'synthetic-setup-owner',
      'X-RadIntel-Tenant': setupTenant,
    };
    const session = await (await fetch(`${apiUrl}/api/v1/session`, { headers })).json();
    const scoped = `${apiUrl}/api/v1/facilities/${session.facilities[0].id}`;
    const patients = await (await fetch(`${scoped}/patients`, { headers })).json();
    const worklist = await (await fetch(`${scoped}/worklist`, { headers })).json();
    if (patients.total !== 3 || worklist.total !== 3)
      throw new Error('Local synthetic setup duplicated records.');
    const draftOrder = worklist.items.find((item) => item.modality === 'MR');
    const reports = await (
      await fetch(`${scoped}/imaging-orders/${draftOrder.id}/reports`, { headers })
    ).json();
    if (reports.length !== 1 || reports[0].status !== 'Draft' || reports[0].currentVersion !== 1)
      throw new Error('Local synthetic setup did not preserve one unsigned draft revision.');
    console.log('Local demo setup replay preserved exactly three synthetic patient/order cases.');
  }
  console.log(
    'Running React browser scenarios against the actual API and a new synthetic database.',
  );
  const npm = process.env.npm_execpath;
  if (!npm) throw new Error('Invoke this runner through npm run test:integration.');
  await run(
    process.execPath,
    [npm, 'run', viewerProof ? 'test:e2e:viewer' : 'test:e2e:api'],
    frontend,
    {
      ...runtime,
      RADINTEL_TEST_API_URL: apiUrl,
      RADINTEL_TEST_API_TOKEN: token,
      ...(viewerProof
        ? {
            RADINTEL_VIEWER_TENANT: viewerTenant,
            RADINTEL_VIEWER_FACILITY: viewerFacility,
            VITE_VIEWER_ORIGIN: viewerHost.origin,
          }
        : {}),
    },
  );
  console.log('Integration checks passed.');
} finally {
  await stop(api);
  await Promise.allSettled([viewerHost?.close(), syntheticArchive?.close()]);
  try {
    if (databaseCreated)
      await run(
        'dotnet',
        [
          join(
            backend,
            'tools',
            'RadIntel.TestDatabase',
            'bin',
            'Release',
            'net9.0',
            'RadIntel.TestDatabase.dll',
          ),
          'drop',
          database,
        ],
        backend,
      );
  } finally {
    if (clusterStarted)
      await run(
        join(pgBin, 'pg_ctl' + (process.platform === 'win32' ? '.exe' : '')),
        ['stop', '-D', pgData, '-m', 'fast', '-w'],
        backend,
      );
  }
}
