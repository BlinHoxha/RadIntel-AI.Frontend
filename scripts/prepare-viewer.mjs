import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const pin = JSON.parse(await readFile(join(root, 'viewer/ohif.lock.json'), 'utf8'));
const folder = join(root, '.tools/ohif');
await mkdir(folder, { recursive: true });
const archive = join(folder, 'ohif-app-' + pin.version + '.tgz');
let bytes = await readFile(archive).catch(() => null);
if (!bytes) {
  const response = await fetch(pin.tarball, {
    signal: AbortSignal.timeout(120000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error('Could not download the pinned OHIF artifact.');
  bytes = Buffer.from(await response.arrayBuffer());
}
if (
  'sha512-' + createHash('sha512').update(bytes).digest('base64') !== pin.integrity ||
  createHash('sha256').update(bytes).digest('hex') !== pin.sha256
)
  throw new Error('OHIF artifact integrity mismatch.');
await writeFile(archive, bytes);
const tar = gunzipSync(bytes, { maxOutputLength: 256 * 1024 * 1024 });
const output = join(folder, pin.version);
const files = {};
for (let offset = 0; offset + 512 <= tar.length; ) {
  const header = tar.subarray(offset, offset + 512);
  const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/s, '');
  if (!name) break;
  const size =
    parseInt(header.subarray(124, 136).toString('ascii').replace(/\0.*$/s, '').trim(), 8) || 0;
  const type = header[156];
  const content = tar.subarray(offset + 512, offset + 512 + size);
  offset += 512 + Math.ceil(size / 512) * 512;
  if (name !== 'package/LICENSE' && !name.startsWith('package/dist/')) continue;
  if (type !== 0 && type !== 48) throw new Error('Unexpected OHIF archive entry type.');
  const relative = name === 'package/LICENSE' ? 'LICENSE' : name.slice('package/dist/'.length);
  if (
    !relative ||
    relative.includes('\\') ||
    relative.split('/').some((p) => p === '..' || p === '.') ||
    relative.startsWith('/')
  )
    throw new Error('Unsafe archive path.');
  const destination = resolve(output, relative);
  if (
    !destination.startsWith(
      resolve(output) + '/'.replace('/', process.platform === 'win32' ? '\\' : '/'),
    )
  )
    throw new Error('Archive escaped output directory.');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
  files[relative] = createHash('sha256').update(content).digest('hex');
}
if (!files['index.html'] || !files['LICENSE']) throw new Error('Incomplete OHIF static artifact.');
await writeFile(
  join(output, 'radintel-artifact.json'),
  JSON.stringify({ ...pin, files }, null, 2) + '\n',
);
console.log(
  'Prepared verified OHIF ' +
    pin.version +
    ': ' +
    Object.keys(files).length +
    ' self-hosted files.',
);
