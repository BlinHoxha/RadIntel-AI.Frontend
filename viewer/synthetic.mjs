// Deterministic generated pixels, never patient images. Shared by demo and owned HTTP fixture.
export function fixture(kind = 'CT') {
  const ct = kind === 'CT';
  const studyInstanceUid = ct ? '1.2.826.0.1.3680043.10.543.610' : '1.2.826.0.1.3680043.10.543.620';
  const tag = (vr, ...Value) => ({ vr, Value });
  const size = ct ? 64 : 128;
  const instances = Array.from({ length: ct ? 3 : 1 }, (_, index) => ({
    '0020000D': tag('UI', studyInstanceUid),
    '0020000E': tag('UI', studyInstanceUid + '.1'),
    '00080018': tag('UI', studyInstanceUid + '.1.' + (index + 1)),
    '00080016': tag('UI', ct ? '1.2.840.10008.5.1.4.1.1.2' : '1.2.840.10008.5.1.4.1.1.1.1'),
    '00280010': tag('US', size),
    '00280011': tag('US', size),
    '00280002': tag('US', 1),
    '00280004': tag('CS', 'MONOCHROME2'),
    '00280100': tag('US', 16),
    '00280101': tag('US', 16),
    '00280102': tag('US', 15),
    '00280103': tag('US', 0),
    '00282110': tag('CS', '00'),
    '00281053': tag('DS', '1'),
    '00281052': tag('DS', ct ? '-1024' : '0'),
    '00280030': tag('DS', '0.75', '0.75'),
    '00200037': tag('DS', '1', '0', '0', '0', '1', '0'),
    '00200032': tag('DS', '0', '0', String(index * 2)),
  }));
  return {
    kind: ct ? 'CT' : 'DX',
    studyInstanceUid,
    patientIdentifier: 'SYN-VIEWER-' + (ct ? 'CT' : 'DX'),
    issuer: 'SYNTHETIC',
    instances,
  };
}
export function pixels(index = 0, kind = 'CT') {
  const size = kind === 'CT' ? 64 : 128;
  const bytes = new Uint8Array(size * size * 2);
  const view = new DataView(bytes.buffer);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const center = Math.hypot(x - size / 2, y - size / 2) < size / 4;
      view.setUint16(
        (y * size + x) * 2,
        (x * 33 + y * 17 + index * 256 + (center ? 1500 : 0)) % 4096,
        true,
      );
    }
  return bytes;
}
export function demoContext(kind, studyId) {
  const source = fixture(kind);
  return {
    contractVersion: 1,
    studyId,
    studyInstanceUid: source.studyInstanceUid,
    support: 'LimitedRaw16Proof',
    instances: source.instances.map((m) => ({
      studyInstanceUid: source.studyInstanceUid,
      seriesInstanceUid: m['0020000E'].Value[0],
      sopInstanceUid: m['00080018'].Value[0],
      sopClassUid: m['00080016'].Value[0],
      rows: m['00280010'].Value[0],
      columns: m['00280011'].Value[0],
      frames: 1,
      bitsAllocated: 16,
      bitsStored: 16,
      highBit: 15,
      pixelRepresentation: 0,
      photometricInterpretation: 'MONOCHROME2',
      samplesPerPixel: 1,
      rescaleSlope: 1,
      rescaleIntercept: kind === 'CT' ? -1024 : 0,
      pixelSpacing: [0.75, 0.75],
      imageOrientationPatient: [1, 0, 0, 0, 1, 0],
      imagePositionPatient: m['00200032'].Value.map(Number),
      supported: true,
      unsupportedReason: null,
      metadataHash: 'A'.repeat(64),
    })),
  };
}
