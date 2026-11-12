import { describe, expect, it } from 'vitest';
import { demoContext } from '../../../viewer/synthetic.mjs';
import {
  axisLetters,
  displayContext,
  formatPosition,
  formatSpacing,
  orientationLabels,
  planViewer,
} from './geometry';
import type { ViewerContext } from './viewerTransport';

const studyId = '10000000-0000-4000-8000-000000000003';
const geo = () => demoContext('GEO', studyId) as ViewerContext;
const uid = (suffix: string) => '1.2.826.0.1.3680043.10.543.630.' + suffix;

describe('viewer geometry planning', () => {
  it('maps LPS axes to patient letters, including oblique combinations', () => {
    expect(axisLetters([1, 0, 0])).toBe('L');
    expect(axisLetters([-1, 0, 0])).toBe('R');
    expect(axisLetters([0, 1, 0])).toBe('P');
    expect(axisLetters([0, 0, -1])).toBe('F');
    expect(axisLetters([Math.SQRT1_2, -Math.SQRT1_2, 0])).toMatch(/^(LA|AL)$/);
    expect(axisLetters([0.1, 0.1, 0.1])).toBe('?');
  });

  it('derives screen-edge labels from direction cosines', () => {
    // Axial: rows run to patient left, columns run posterior.
    expect(orientationLabels([1, 0, 0, 0, 1, 0])).toEqual({
      left: 'R',
      right: 'L',
      top: 'A',
      bottom: 'P',
    });
    // Coronal: rows run to patient left, columns run toward the feet.
    expect(orientationLabels([1, 0, 0, 0, 0, -1])).toEqual({
      left: 'R',
      right: 'L',
      top: 'H',
      bottom: 'F',
    });
    expect(orientationLabels([1, 0, 0, 1, 0, 0])).toBeNull();
    expect(orientationLabels(null)).toBeNull();
  });

  it('orders a shuffled stack by position along the slice normal, not by source order', () => {
    const plan = planViewer(geo());
    const axial = plan.series[0];
    expect(axial.seriesInstanceUid).toBe(uid('1'));
    expect(axial.orderVerified).toBe(true);
    expect(axial.images.map((image) => image.sopInstanceUid)).toEqual([
      uid('1.2'),
      uid('1.3'),
      uid('1.1'),
    ]);
    expect(axial.images.map((image) => image.position![2])).toEqual([0, 2, 4]);
    expect(axial.images.map((image) => image.slice + '/' + image.sliceCount)).toEqual([
      '1/3',
      '2/3',
      '3/3',
    ]);
  });

  it('keeps each series geometry separate, including anisotropic spacing', () => {
    const plan = planViewer(geo());
    const coronal = plan.series[1];
    // Normal = row x column = (1,0,0) x (0,0,-1) = (0,1,0); y 0 before y 3.
    expect(coronal.images.map((image) => image.sopInstanceUid)).toEqual([uid('2.2'), uid('2.1')]);
    expect(coronal.images[0].orientation).toEqual({ left: 'R', right: 'L', top: 'H', bottom: 'F' });
    expect(coronal.images[0].pixelSpacing).toEqual([0.5, 1]);
    expect(formatSpacing(coronal.images[0].pixelSpacing)).toBe(
      '0.5 mm between rows × 1 mm between columns',
    );
    expect(plan.series[0].images[0].orientation?.bottom).toBe('P');
  });

  it('warns about missing spacing and excluded images without showing them', () => {
    const plan = planViewer(geo());
    expect(plan.series).toHaveLength(3);
    expect(plan.series[2].warnings).toEqual(['Measurement unavailable: pixel spacing missing']);
    expect(formatSpacing(plan.series[2].images[0].pixelSpacing)).toBe(
      'Measurement unavailable: pixel spacing missing',
    );
    expect(plan.warnings).toEqual([
      'Multiframe image unsupported (1 image not shown)',
      'Unsupported image format (1 image not shown)',
    ]);
    const shown = plan.images.map((image) => image.sopInstanceUid);
    expect(shown).not.toContain(uid('4.1'));
    expect(shown).not.toContain(uid('5.1'));
    expect(plan.images.map((image) => image.displayIndex)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('marks order unverified when geometry is missing, inconsistent or duplicated', () => {
    const base = geo();
    const axial = base.instances.filter((entry) => entry.seriesInstanceUid === uid('1'));
    const missing = {
      ...base,
      instances: axial.map((e, i) => (i === 1 ? { ...e, imagePositionPatient: null } : e)),
    };
    const plan = planViewer(missing);
    expect(plan.series[0].orderVerified).toBe(false);
    expect(plan.series[0].warnings).toContain(
      'Slice order unverified: position or orientation unavailable',
    );
    // Source order is kept rather than guessed.
    expect(plan.series[0].images.map((image) => image.sopInstanceUid)).toEqual(
      axial.map((entry) => entry.sopInstanceUid),
    );
    expect(formatPosition(plan.series[0].images[1].position)).toBe('Position unavailable');
    const mixed = {
      ...base,
      instances: axial.map((e, i) =>
        i === 0 ? { ...e, imageOrientationPatient: [1, 0, 0, 0, 0, -1] } : e,
      ),
    };
    expect(planViewer(mixed).series[0].orderVerified).toBe(false);
    const duplicate = {
      ...base,
      instances: axial.map((e) => ({ ...e, imagePositionPatient: [0, 0, 1] })),
    };
    const duplicated = planViewer(duplicate).series[0];
    expect(duplicated.orderVerified).toBe(false);
    expect(duplicated.warnings).toContain('Slice order unverified: duplicate slice positions');
  });

  it('sends the child only displayable instances in planned order', () => {
    const context = geo();
    const plan = planViewer(context);
    const child = displayContext(context, plan);
    expect(child.instances.map((entry) => entry.sopInstanceUid)).toEqual(
      plan.images.map((image) => image.sopInstanceUid),
    );
    expect(child.instances.every((entry) => entry.supported && entry.frames === 1)).toBe(true);
    expect(child.studyInstanceUid).toBe(context.studyInstanceUid);
  });

  it('formats positions with one decimal place in millimetres', () => {
    expect(formatPosition([0, 0, 2])).toBe('(0.0, 0.0, 2.0) mm');
  });
});
