import { createServer } from 'node:http';
import { fixture, fixtureKinds, pixels } from '../viewer/synthetic.mjs';
export async function startSyntheticArchive() {
  const sources = fixtureKinds.map((kind) => fixture(kind));
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    if (req.method !== 'GET' || parts[0] !== 'studies') {
      res.writeHead(404).end();
      return;
    }
    const source = sources.find(
      (item) => item.studyInstanceUid === (parts[1] || url.searchParams.get('StudyInstanceUID')),
    );
    if (!source) {
      res.writeHead(404).end();
      return;
    }
    if (parts.length === 1) {
      res.setHeader('Content-Type', 'application/dicom+json');
      res.end(
        JSON.stringify([
          {
            '0020000D': { vr: 'UI', Value: [source.studyInstanceUid] },
            '00100020': { vr: 'LO', Value: [source.patientIdentifier] },
            '00100021': { vr: 'LO', Value: [source.issuer] },
          },
        ]),
      );
      return;
    }
    if (parts.length === 3 && parts[2] === 'metadata') {
      res.setHeader('Content-Type', 'application/dicom+json');
      res.end(JSON.stringify(source.instances));
      return;
    }
    const index = source.instances.findIndex(
      (entry) => entry['0020000E'].Value[0] === parts[3] && entry['00080018'].Value[0] === parts[5],
    );
    if (index < 0 || parts[2] !== 'series' || parts[4] !== 'instances') {
      res.writeHead(404).end();
      return;
    }
    if (parts.length === 7 && parts[6] === 'metadata') {
      res.setHeader('Content-Type', 'application/dicom+json');
      res.end(JSON.stringify([source.instances[index]]));
      return;
    }
    if (parts.length === 8 && parts[6] === 'frames' && parts[7] === '1') {
      res.setHeader(
        'Content-Type',
        'multipart/related; type="application/octet-stream"; boundary=synthetic-proof' +
          (source.transferSyntax ? '; transfer-syntax=' + source.transferSyntax : ''),
      );
      res.end(
        Buffer.concat([
          Buffer.from('--synthetic-proof\r\nContent-Type: application/octet-stream\r\n\r\n'),
          Buffer.from(pixels(index, source.kind)),
          Buffer.from('\r\n--synthetic-proof--\r\n'),
        ]),
      );
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', done);
  });
  return {
    origin: 'http://127.0.0.1:' + server.address().port,
    close: () => new Promise((done) => server.close(done)),
  };
}
