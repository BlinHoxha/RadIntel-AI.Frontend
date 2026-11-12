import { describe, expect, it } from 'vitest';
import dicomParser from 'dicom-parser';
import { createHash } from 'node:crypto';
import { dicom } from '../../../viewer/dicom.mjs';
import { demoContext, fixture, fixtureKinds, pixels } from '../../../viewer/synthetic.mjs';
import fixtures from '../../../viewer/fixtures.lock.json';
const studyId = '10000000-0000-4000-8000-000000000003';
describe('proof Part 10 adapter interoperability', () => {
  it.each(['CT', 'DX'])(
    'preserves %s pixels, exact identities and geometry through an independent DICOM parser',
    (kind) => {
      const context = demoContext(kind, studyId);
      const entry = context.instances[0];
      const raw = pixels(0, kind);
      const wrapped = new Uint8Array(dicom(entry, raw.buffer));
      const parsed = dicomParser.parseDicom(wrapped);
      expect(parsed.string('x00020010')).toBe('1.2.840.10008.1.2.1');
      expect(parsed.string('x0020000d')).toBe(entry.studyInstanceUid);
      expect(parsed.string('x0020000e')).toBe(entry.seriesInstanceUid);
      expect(parsed.string('x00080018')).toBe(entry.sopInstanceUid);
      expect(parsed.uint16('x00280010')).toBe(entry.rows);
      expect(parsed.uint16('x00280103')).toBe(0);
      expect(parsed.string('x00280030')).toBe('0.75\\0.75');
      expect(parsed.string('x00200037')).toBe('1\\0\\0\\0\\1\\0');
      const pixel = parsed.elements.x7fe00010;
      expect(wrapped.slice(pixel.dataOffset, pixel.dataOffset + pixel.length)).toEqual(raw);
      expect(parsed.elements.x00100010).toBeUndefined(); // No invented patient identity in wrapper.
      const values = new DataView(raw.buffer);
      const center = entry.rows / 2;
      expect(values.getUint16((center * entry.columns + center) * 2, true)).toBe(
        kind === 'CT' ? 3100 : 604,
      );
    },
  );
  it('rejects truncated raw data before creating a DICOM object', () => {
    expect(() => dicom(demoContext('CT', studyId).instances[0], new ArrayBuffer(2))).toThrow();
  });
  it.each(['CT', 'DX', 'GEO'] as const)(
    'matches the pinned generated %s pixel fixture hashes',
    (kind) => {
      const context = demoContext(kind, studyId);
      const hashes = context.instances.map((entry, index) =>
        entry.supported ? createHash('sha256').update(pixels(index, kind)).digest('hex') : null,
      );
      expect(hashes).toEqual(fixtures.fixtures[kind].pixelSha256);
    },
  );
  it.each(fixtureKinds)('regenerates identical %s metadata matching the manifest', (kind) => {
    const first = JSON.stringify(fixture(kind).instances);
    expect(JSON.stringify(fixture(kind).instances)).toBe(first);
    expect(createHash('sha256').update(first).digest('hex')).toBe(
      fixtures.fixtures[kind as keyof typeof fixtures.fixtures].metadataSha256,
    );
  });
  it('classifies geometry fixtures like the backend proof profile', () => {
    const context = demoContext('GEO', studyId);
    expect(context.instances.map((entry) => [entry.supported, entry.frames])).toEqual([
      [true, 1],
      [true, 1],
      [true, 1],
      [true, 1],
      [true, 1],
      [true, 1],
      [false, 2],
      [false, 1],
    ]);
    expect(context.instances[3].pixelSpacing).toEqual([0.5, 1]);
    expect(context.instances[5].pixelSpacing).toBeNull();
    const mismatch = demoContext('MISMATCH', studyId);
    expect(mismatch.instances[1].studyInstanceUid).not.toBe(mismatch.studyInstanceUid);
  });
  it('carries anisotropic 0.5 x 1.0 mm spacing and coronal orientation through the wrapper', () => {
    const entry = demoContext('GEO', studyId).instances[3];
    const parsed = dicomParser.parseDicom(new Uint8Array(dicom(entry, pixels(3, 'GEO').buffer)));
    expect(parsed.string('x00280030')).toBe('0.5\\1');
    expect(parsed.string('x00200037')).toBe('1\\0\\0\\0\\0\\-1');
  });
});
