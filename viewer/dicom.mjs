function concatenate(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(new Uint8Array(part.buffer || part, part.byteOffset || 0, part.byteLength), offset);
    offset += part.byteLength;
  }
  return out;
}
function element(group, tag, vr, value) {
  let bytes;
  if (vr === 'US') {
    bytes = new Uint8Array(2);
    new DataView(bytes.buffer).setUint16(0, value, true);
  } else if (vr === 'UL') {
    bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value, true);
  } else if (value instanceof Uint8Array) bytes = value;
  else {
    const text = Array.isArray(value) ? value.join('\\') : String(value);
    bytes = new TextEncoder().encode(text);
  }
  if (bytes.length % 2) bytes = concatenate([bytes, new Uint8Array([vr === 'UI' ? 0 : 32])]);
  const large = ['OB', 'OW', 'SQ', 'UN', 'UT'].includes(vr);
  const header = new Uint8Array(large ? 12 : 8);
  const view = new DataView(header.buffer);
  view.setUint16(0, group, true);
  view.setUint16(2, tag, true);
  header[4] = vr.charCodeAt(0);
  header[5] = vr.charCodeAt(1);
  if (large) view.setUint32(8, bytes.length, true);
  else view.setUint16(6, bytes.length, true);
  return concatenate([header, bytes]);
}
export function dicom(entry, pixels) {
  if (!(pixels instanceof ArrayBuffer) || pixels.byteLength !== entry.rows * entry.columns * 2)
    throw new Error('Invalid scoped pixels.');
  const e = element;
  const meta = [
    e(2, 1, 'OB', new Uint8Array([0, 1])),
    e(2, 2, 'UI', entry.sopClassUid),
    e(2, 3, 'UI', entry.sopInstanceUid),
    e(2, 16, 'UI', '1.2.840.10008.1.2.1'),
    e(2, 18, 'UI', '2.25.196586819031469697188003973572651698342'),
  ];
  const preamble = new Uint8Array(132);
  preamble.set(new TextEncoder().encode('DICM'), 128);
  const parts = [
    preamble,
    e(
      2,
      0,
      'UL',
      meta.reduce((n, p) => n + p.length, 0),
    ),
    ...meta,
    e(8, 22, 'UI', entry.sopClassUid),
    e(8, 24, 'UI', entry.sopInstanceUid),
    e(32, 13, 'UI', entry.studyInstanceUid),
    e(32, 14, 'UI', entry.seriesInstanceUid),
    e(40, 2, 'US', 1),
    e(40, 4, 'CS', 'MONOCHROME2'),
    e(40, 16, 'US', entry.rows),
    e(40, 17, 'US', entry.columns),
    e(40, 256, 'US', 16),
    e(40, 257, 'US', 16),
    e(40, 258, 'US', 15),
    e(40, 259, 'US', 0),
  ];
  if (entry.pixelSpacing) parts.push(e(40, 48, 'DS', entry.pixelSpacing));
  if (entry.imageOrientationPatient) parts.push(e(32, 55, 'DS', entry.imageOrientationPatient));
  if (entry.imagePositionPatient) parts.push(e(32, 50, 'DS', entry.imagePositionPatient));
  if (entry.rescaleIntercept !== null) parts.push(e(40, 4178, 'DS', entry.rescaleIntercept));
  if (entry.rescaleSlope !== null) parts.push(e(40, 4179, 'DS', entry.rescaleSlope));
  parts.push(e(32736, 16, 'OW', new Uint8Array(pixels)));
  const prefix = parts.slice(0, 2 + meta.length);
  const data = parts.slice(2 + meta.length).sort((a, b) => {
    const left = new DataView(a.buffer, a.byteOffset, a.byteLength);
    const right = new DataView(b.buffer, b.byteOffset, b.byteLength);
    return (
      left.getUint16(0, true) * 65536 +
      left.getUint16(2, true) -
      (right.getUint16(0, true) * 65536 + right.getUint16(2, true))
    );
  });
  return concatenate([...prefix, ...data]).buffer;
}
