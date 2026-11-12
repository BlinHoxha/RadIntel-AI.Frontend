import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function startViewerServer({
  port = 5184,
  parentOrigin = 'http://127.0.0.1:5173',
} = {}) {
  const parent = new URL(parentOrigin);
  if (
    parent.origin !== parentOrigin ||
    parent.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost'].includes(parent.hostname)
  )
    throw new Error('Viewer proof requires an exact loopback HTTP parent origin.');
  const pin = JSON.parse(await readFile(join(root, 'viewer/ohif.lock.json'), 'utf8'));
  const folder = join(root, '.tools/ohif', pin.version);
  const manifest = JSON.parse(
    await readFile(join(folder, 'radintel-artifact.json'), 'utf8').catch(() => {
      throw new Error('Run npm run viewer:prepare first.');
    }),
  );
  if (manifest.integrity !== pin.integrity || manifest.sha256 !== pin.sha256)
    throw new Error('Viewer pin mismatch.');
  const nonce = randomBytes(24).toString('base64');
  const mime = {
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
  };
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'none'; script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob:; worker-src 'self' blob:; frame-ancestors ${parentOrigin}; base-uri 'none'; object-src 'none'; form-action 'none'`,
    );
    try {
      if (req.method !== 'GET') {
        res.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/radintel-bootstrap.js') {
        const code = await readFile(join(root, 'viewer/bootstrap.js'), 'utf8');
        res.setHeader('Content-Type', 'text/javascript');
        res.end('window.RADINTEL_PARENT_ORIGIN=' + JSON.stringify(parentOrigin) + ';\n' + code);
        return;
      }
      if (pathname === '/radintel-dicom.mjs') {
        res.setHeader('Content-Type', 'text/javascript');
        res.end(await readFile(join(root, 'viewer/dicom.mjs')));
        return;
      }
      if (pathname === '/app-config.js') {
        res.setHeader('Content-Type', 'text/javascript');
        res.end(await readFile(join(root, 'viewer/config.js'), 'utf8'));
        return;
      }
      let name = pathname.slice(1);
      if (pathname === '/' || pathname === '/viewer/dicomjson') name = 'index.html';
      if (
        !Object.hasOwn(manifest.files, name) ||
        name.includes('..') ||
        name.includes('\\') ||
        name === 'init-service-worker.js' ||
        /service-worker|workbox|sw\.js/.test(name)
      ) {
        res.writeHead(404).end();
        return;
      }
      let content = await readFile(resolve(folder, name));
      if (createHash('sha256').update(content).digest('hex') !== manifest.files[name])
        throw new Error('Asset integrity mismatch.');
      if (name === 'index.html') {
        content = Buffer.from(
          content
            .toString('utf8')
            .replace(/<script[^>]*src="\/init-service-worker\.js"[^>]*><\/script>/, '')
            .replace('<head>', '<head><script src="/radintel-bootstrap.js"></script>')
            .replaceAll('<script>', '<script nonce="' + nonce + '">'),
        );
        res.setHeader('Content-Type', 'text/html');
      } else res.setHeader('Content-Type', mime[extname(name)] || 'application/octet-stream');
      res.end(content);
    } catch {
      res.writeHead(503).end('The local viewer proof could not load a verified asset.');
    }
  });
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', done);
  });
  return {
    origin: 'http://127.0.0.1:' + server.address().port,
    close: () => new Promise((done) => server.close(done)),
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const viewer = await startViewerServer({
    port: Number(process.env.RADINTEL_VIEWER_PORT || 5184),
    parentOrigin: process.env.RADINTEL_VIEWER_PARENT_ORIGIN || 'http://127.0.0.1:5173',
  });
  console.log(
    'Synthetic OHIF proof listening at ' + viewer.origin + '; parent transport required.',
  );
}
