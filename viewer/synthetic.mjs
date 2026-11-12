// Deterministic generated pixels, never patient images. Shared by demo and owned HTTP fixture.
const CT_CLASS = '1.2.840.10008.5.1.4.1.1.2';
const DX_CLASS = '1.2.840.10008.5.1.4.1.1.1.1';
const STUDY = {
  CT: '1.2.826.0.1.3680043.10.543.610',
  DX: '1.2.826.0.1.3680043.10.543.620',
  GEO: '1.2.826.0.1.3680043.10.543.630',
  MISMATCH: '1.2.826.0.1.3680043.10.543.640',
  TSYNTAX: '1.2.826.0.1.3680043.10.543.650',
};
// TSYNTAX metadata is inside the proof profile, but its archive frame is labelled JPEG Baseline;
// the backend rejects that frame, so the format problem appears only when pixels are requested.
export const UNSUPPORTED_TRANSFER_SYNTAX = '1.2.840.10008.1.2.4.50';
export const fixtureKinds = Object.keys(STUDY);
const tag = (vr, ...Value) => ({ vr, Value });
function instance(study, series, sop, options = {}) {
  const size = options.size ?? 64;
  const bits = options.bits ?? 16;
  const result = {
    '0020000D': tag('UI', options.studyOverride ?? study),
    '0020000E': tag('UI', series),
    '00080018': tag('UI', sop),
    '00080016': tag('UI', options.sopClass ?? CT_CLASS),
    '00280010': tag('US', size),
    '00280011': tag('US', size),
    '00280002': tag('US', 1),
    '00280004': tag('CS', 'MONOCHROME2'),
    '00280100': tag('US', bits),
    '00280101': tag('US', bits),
    '00280102': tag('US', bits - 1),
    '00280103': tag('US', 0),
    '00282110': tag('CS', '00'),
    '00281053': tag('DS', '1'),
    '00281052': tag('DS', options.intercept ?? '-1024'),
  };
  if (options.frames) result['00280008'] = tag('IS', options.frames);
  if (options.spacing !== null)
    result['00280030'] = tag('DS', ...(options.spacing ?? ['0.75', '0.75']));
  result['00200037'] = tag('DS', ...(options.orientation ?? ['1', '0', '0', '0', '1', '0']));
  result['00200032'] = tag('DS', ...options.position);
  return result;
}
// GEO: four series exercising geometric order, anisotropic spacing, missing spacing and
// two instances outside the proof profile (multiframe, 8-bit). Source order is shuffled.
function geometryInstances(study) {
  const s = (n) => study + '.' + n;
  return [
    instance(study, s(1), s(1) + '.1', { position: ['0', '0', '4'] }),
    instance(study, s(1), s(1) + '.2', { position: ['0', '0', '0'] }),
    instance(study, s(1), s(1) + '.3', { position: ['0', '0', '2'] }),
    instance(study, s(2), s(2) + '.1', {
      spacing: ['0.5', '1.0'],
      orientation: ['1', '0', '0', '0', '0', '-1'],
      position: ['0', '3', '0'],
    }),
    instance(study, s(2), s(2) + '.2', {
      spacing: ['0.5', '1.0'],
      orientation: ['1', '0', '0', '0', '0', '-1'],
      position: ['0', '0', '0'],
    }),
    instance(study, s(3), s(3) + '.1', { spacing: null, position: ['0', '0', '0'] }),
    instance(study, s(4), s(4) + '.1', { frames: 2, position: ['0', '0', '0'] }),
    instance(study, s(5), s(5) + '.1', { bits: 8, position: ['0', '0', '0'] }),
  ];
}
export function fixture(kind = 'CT') {
  const studyInstanceUid = STUDY[kind] ?? STUDY.DX;
  const resolved = STUDY[kind] ? kind : 'DX';
  let instances;
  if (resolved === 'GEO') instances = geometryInstances(studyInstanceUid);
  else if (resolved === 'MISMATCH')
    instances = [
      instance(studyInstanceUid, studyInstanceUid + '.1', studyInstanceUid + '.1.1', {
        position: ['0', '0', '0'],
      }),
      instance(studyInstanceUid, studyInstanceUid + '.1', studyInstanceUid + '.1.2', {
        position: ['0', '0', '2'],
        studyOverride: STUDY.CT,
      }),
    ];
  else if (resolved === 'TSYNTAX')
    instances = [
      instance(studyInstanceUid, studyInstanceUid + '.1', studyInstanceUid + '.1.1', {
        position: ['0', '0', '0'],
      }),
    ];
  else {
    const ct = resolved === 'CT';
    instances = Array.from({ length: ct ? 3 : 1 }, (_, index) =>
      instance(studyInstanceUid, studyInstanceUid + '.1', studyInstanceUid + '.1.' + (index + 1), {
        size: ct ? 64 : 128,
        sopClass: ct ? CT_CLASS : DX_CLASS,
        intercept: ct ? '-1024' : '0',
        position: ['0', '0', String(index * 2)],
      }),
    );
  }
  return {
    kind: resolved,
    studyInstanceUid,
    patientIdentifier: 'SYN-VIEWER-' + resolved,
    issuer: 'SYNTHETIC',
    instances,
    ...(resolved === 'TSYNTAX' ? { transferSyntax: UNSUPPORTED_TRANSFER_SYNTAX } : {}),
  };
}
export function pixels(index = 0, kind = 'CT') {
  const size = kind === 'DX' ? 128 : 64;
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
const value = (m, key) => m[key]?.Value[0];
const numbers = (m, key) => m[key]?.Value.map(Number) ?? null;
// Mirrors the backend proof profile so demo and real API classify instances identically.
function profile(m) {
  const frames = value(m, '00280008') ?? 1;
  const supported =
    [CT_CLASS, DX_CLASS, '1.2.840.10008.5.1.4.1.1.1'].includes(value(m, '00080016')) &&
    frames === 1 &&
    value(m, '00280100') === 16 &&
    value(m, '00280101') === 16 &&
    value(m, '00280102') === 15 &&
    value(m, '00280103') === 0 &&
    value(m, '00280002') === 1 &&
    value(m, '00280004') === 'MONOCHROME2' &&
    value(m, '00282110') === '00';
  return { frames, supported };
}
export function demoContext(kind, studyId) {
  const source = fixture(kind);
  return {
    contractVersion: 1,
    studyId,
    studyInstanceUid: source.studyInstanceUid,
    support: 'LimitedRaw16Proof',
    instances: source.instances.map((m) => {
      const { frames, supported } = profile(m);
      return {
        studyInstanceUid: value(m, '0020000D'),
        seriesInstanceUid: value(m, '0020000E'),
        sopInstanceUid: value(m, '00080018'),
        sopClassUid: value(m, '00080016'),
        rows: value(m, '00280010'),
        columns: value(m, '00280011'),
        frames,
        bitsAllocated: value(m, '00280100'),
        bitsStored: value(m, '00280101'),
        highBit: value(m, '00280102'),
        pixelRepresentation: value(m, '00280103'),
        photometricInterpretation: value(m, '00280004'),
        samplesPerPixel: value(m, '00280002'),
        rescaleSlope: Number(value(m, '00281053')),
        rescaleIntercept: Number(value(m, '00281052')),
        pixelSpacing: numbers(m, '00280030'),
        imageOrientationPatient: numbers(m, '00200037'),
        imagePositionPatient: numbers(m, '00200032'),
        supported,
        unsupportedReason: supported
          ? null
          : 'Outside the single-frame unsigned raw-16 proof profile.',
        metadataHash: 'A'.repeat(64),
      };
    }),
  };
}
