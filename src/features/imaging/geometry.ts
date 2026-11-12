import type { ViewerContext, ViewerInstance } from './viewerTransport';

// Pure display planning for the scoped viewer. It never guesses geometry: an order or label is
// shown as verified only when every input it depends on is present and consistent.
export type Vec3 = [number, number, number];
export interface OrientationLabels {
  left: string;
  right: string;
  top: string;
  bottom: string;
}
export interface PlannedImage {
  displayIndex: number;
  sopInstanceUid: string;
  seriesInstanceUid: string;
  seriesNumber: number;
  slice: number;
  sliceCount: number;
  orderVerified: boolean;
  position: Vec3 | null;
  orientation: OrientationLabels | null;
  pixelSpacing: [number, number] | null;
}
export interface PlannedSeries {
  seriesInstanceUid: string;
  number: number;
  images: PlannedImage[];
  orderVerified: boolean;
  warnings: string[];
}
export interface ViewerPlan {
  series: PlannedSeries[];
  images: PlannedImage[];
  warnings: string[];
  instances: ViewerInstance[];
}

const EPSILON = 1e-3;
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: number[], b: number[]): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

// DICOM patient coordinates (LPS): +x Left, +y Posterior, +z Head.
export function axisLetters(vector: number[]) {
  const letters = [
    ['L', 'R'],
    ['P', 'A'],
    ['H', 'F'],
  ];
  const parts = vector
    .map((value, axis) => ({ value, axis }))
    .filter(({ value }) => Math.abs(value) >= 0.25)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .map(({ value, axis }) => letters[axis][value > 0 ? 0 : 1]);
  return parts.join('') || '?';
}

export function validOrientation(iop: number[] | null | undefined): iop is number[] {
  if (!iop || iop.length !== 6 || !iop.every(Number.isFinite)) return false;
  const row = iop.slice(0, 3);
  const column = iop.slice(3, 6);
  return (
    Math.abs(dot(row, row) - 1) < EPSILON &&
    Math.abs(dot(column, column) - 1) < EPSILON &&
    Math.abs(dot(row, column)) < EPSILON
  );
}

// Screen right follows the row direction and screen bottom the column direction.
export function orientationLabels(iop: number[] | null | undefined): OrientationLabels | null {
  if (!validOrientation(iop)) return null;
  const row = iop.slice(0, 3);
  const column = iop.slice(3, 6);
  return {
    right: axisLetters(row),
    left: axisLetters(row.map((v) => -v)),
    bottom: axisLetters(column),
    top: axisLetters(column.map((v) => -v)),
  };
}

export function unsupportedLabel(entry: ViewerInstance) {
  return entry.frames > 1 ? 'Multiframe image unsupported' : 'Unsupported image format';
}

export function formatPosition(position: Vec3 | null) {
  return position
    ? '(' + position.map((value) => value.toFixed(1)).join(', ') + ') mm'
    : 'Position unavailable';
}

export function formatSpacing(spacing: [number, number] | null) {
  return spacing
    ? spacing[0] + ' mm between rows × ' + spacing[1] + ' mm between columns'
    : 'Measurement unavailable: pixel spacing missing';
}

const sameOrientation = (a: number[], b: number[]) =>
  a.every((value, index) => Math.abs(value - b[index]) < EPSILON);

export function planViewer(context: ViewerContext): ViewerPlan {
  const groups = new Map<string, ViewerInstance[]>();
  const excluded = new Map<string, number>();
  for (const entry of context.instances) {
    if (!entry.supported || entry.frames !== 1) {
      const label = unsupportedLabel(entry);
      excluded.set(label, (excluded.get(label) ?? 0) + 1);
      continue;
    }
    const group = groups.get(entry.seriesInstanceUid) ?? [];
    group.push(entry);
    groups.set(entry.seriesInstanceUid, group);
  }
  const warnings = [...excluded].map(
    ([label, count]) => label + ' (' + count + (count === 1 ? ' image' : ' images') + ' not shown)',
  );
  const series: PlannedSeries[] = [];
  const images: PlannedImage[] = [];
  const instances: ViewerInstance[] = [];
  [...groups].forEach(([seriesInstanceUid, entries], seriesIndex) => {
    const seriesWarnings: string[] = [];
    const first = entries[0].imageOrientationPatient;
    const geometric =
      validOrientation(first) &&
      entries.every(
        (entry) =>
          validOrientation(entry.imageOrientationPatient) &&
          sameOrientation(entry.imageOrientationPatient, first) &&
          entry.imagePositionPatient?.length === 3,
      );
    let ordered = entries;
    let orderVerified = entries.length === 1 || geometric;
    if (geometric) {
      const iop = first as number[];
      const normal = cross(iop.slice(0, 3), iop.slice(3, 6));
      const keyed = entries.map((entry) => ({
        entry,
        distance: dot(entry.imagePositionPatient!, normal),
      }));
      keyed.sort((a, b) => a.distance - b.distance);
      if (keyed.some((item, i) => i > 0 && item.distance - keyed[i - 1].distance < EPSILON)) {
        orderVerified = false;
        seriesWarnings.push('Slice order unverified: duplicate slice positions');
      } else ordered = keyed.map((item) => item.entry);
    } else if (entries.length > 1)
      seriesWarnings.push('Slice order unverified: position or orientation unavailable');
    if (entries.some((entry) => !entry.pixelSpacing))
      seriesWarnings.push('Measurement unavailable: pixel spacing missing');
    const planned = ordered.map((entry, slice) => {
      const image: PlannedImage = {
        displayIndex: instances.length + slice,
        sopInstanceUid: entry.sopInstanceUid,
        seriesInstanceUid,
        seriesNumber: seriesIndex + 1,
        slice: slice + 1,
        sliceCount: ordered.length,
        orderVerified,
        position: entry.imagePositionPatient
          ? (entry.imagePositionPatient.slice(0, 3) as Vec3)
          : null,
        orientation: orientationLabels(entry.imageOrientationPatient),
        pixelSpacing: entry.pixelSpacing
          ? (entry.pixelSpacing.slice(0, 2) as [number, number])
          : null,
      };
      return image;
    });
    instances.push(...ordered);
    images.push(...planned);
    series.push({
      seriesInstanceUid,
      number: seriesIndex + 1,
      images: planned,
      orderVerified,
      warnings: seriesWarnings,
    });
  });
  return { series, images, warnings, instances };
}

// The child receives only displayable instances, grouped by series in verified order.
export function displayContext(context: ViewerContext, plan: ViewerPlan): ViewerContext {
  return { ...context, instances: plan.instances.map((entry) => structuredClone(entry)) };
}
