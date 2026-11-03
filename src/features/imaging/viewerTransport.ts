import { z } from 'zod';
import {
  ApiError,
  facilityPath,
  onContextInvalidated,
  request,
  requestBinary,
} from '../../shared/api/client';
import type { components } from '../../shared/api/generated';

export type ViewerContext = components['schemas']['ViewerContextResponse'];
export type ViewerInstance = components['schemas']['ViewerInstance'];
const uid = z
  .string()
  .max(64)
  .regex(/^(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))+$/);
const finiteArray = (n: number) => z.array(z.number().finite()).length(n).nullable();
const descriptor = z.object({
  studyInstanceUid: uid,
  seriesInstanceUid: uid,
  sopInstanceUid: uid,
  sopClassUid: uid,
  rows: z.number().int(),
  columns: z.number().int(),
  frames: z.number().int(),
  bitsAllocated: z.number().int(),
  bitsStored: z.number().int(),
  highBit: z.number().int(),
  pixelRepresentation: z.number().int(),
  photometricInterpretation: z.string(),
  samplesPerPixel: z.number().int(),
  rescaleSlope: z.number().finite().nullable(),
  rescaleIntercept: z.number().finite().nullable(),
  pixelSpacing: finiteArray(2),
  imageOrientationPatient: finiteArray(6),
  imagePositionPatient: finiteArray(3),
  supported: z.boolean(),
  unsupportedReason: z.string().nullable(),
  metadataHash: z.string().regex(/^[A-F0-9]{64}$/),
});
const contextSchema = z.object({
  contractVersion: z.literal(1),
  studyId: z.string().uuid(),
  studyInstanceUid: uid,
  support: z.literal('LimitedRaw16Proof'),
  instances: z.array(descriptor).min(1).max(256),
});

// Transient proof transport only: no renderer or persistent pixel/metadata cache.
export function createViewerTransport(facilityId: string, orderId: string, studyId: string) {
  [facilityId, orderId, studyId].forEach((id) => z.string().uuid().parse(id));
  const controller = new AbortController();
  let disposed = false;
  let active = 0;
  let contextGeneration = 0;
  let context: ViewerContext | undefined;
  const waiting: Array<() => void> = [];
  const unsubscribe = onContextInvalidated(dispose);
  function dispose() {
    if (disposed) return;
    disposed = true;
    controller.abort();
    context = undefined;
    waiting.splice(0).forEach((resume) => resume());
    unsubscribe();
  }
  function alive() {
    if (disposed) throw new DOMException('Viewer context was disposed.', 'AbortError');
  }
  async function limited<T>(operation: () => Promise<T>) {
    alive();
    if (active >= 2) {
      if (waiting.length >= 32) throw new ApiError(429, 'The image request queue is full.');
      await new Promise<void>((resolve) => waiting.push(resolve));
      alive();
    } else active++;
    try {
      const value = await operation();
      alive();
      return value;
    } catch (error) {
      if (error instanceof ApiError && [401, 403, 404, 409].includes(error.status)) dispose();
      throw error;
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  }
  return {
    dispose,
    async loadContext(): Promise<ViewerContext> {
      return limited(async () => {
        const loadGeneration = ++contextGeneration;
        context = undefined;
        const value = await request<unknown>(
          facilityPath(
            facilityId,
            'imaging-orders/' + encodeURIComponent(orderId) + '/viewer-context',
          ),
          'POST',
          { studyId },
          controller.signal,
        );
        const parsed = contextSchema.safeParse(value);
        if (
          !parsed.success ||
          parsed.data.studyId !== studyId ||
          parsed.data.instances.some(
            (entry) => entry.studyInstanceUid !== parsed.data.studyInstanceUid,
          ) ||
          new Set(parsed.data.instances.map((entry) => entry.sopInstanceUid)).size !==
            parsed.data.instances.length
        )
          throw new ApiError(503, 'The viewer context is invalid.');
        alive();
        if (loadGeneration !== contextGeneration)
          throw new ApiError(409, 'The viewer context changed. Reload before continuing.');
        context = parsed.data;
        return structuredClone(context);
      });
    },
    async frame(sopInstanceUid: string): Promise<ArrayBuffer> {
      return limited(async () => {
        const checkedContext = context;
        const entry = checkedContext?.instances.find(
          (item) => item.sopInstanceUid === sopInstanceUid,
        );
        if (
          !entry ||
          !entry.supported ||
          entry.frames !== 1 ||
          entry.bitsAllocated !== 16 ||
          entry.bitsStored !== 16 ||
          entry.highBit !== 15 ||
          entry.pixelRepresentation !== 0 ||
          entry.samplesPerPixel !== 1 ||
          entry.photometricInterpretation !== 'MONOCHROME2' ||
          entry.rows <= 0 ||
          entry.columns <= 0 ||
          entry.rows * entry.columns * 2 > 16 * 1024 * 1024
        )
          throw new ApiError(503, 'This image is not supported by the viewer proof.');
        const pixels = await requestBinary(
          facilityPath(facilityId, 'studies/' + encodeURIComponent(studyId) + '/viewer-frames'),
          {
            seriesInstanceUid: entry.seriesInstanceUid,
            sopInstanceUid: entry.sopInstanceUid,
            frameNumber: 1,
            expectedMetadataHash: entry.metadataHash,
          },
          controller.signal,
        );
        if (context !== checkedContext)
          throw new ApiError(409, 'The viewer context changed. Reload before continuing.');
        if (pixels.byteLength !== entry.rows * entry.columns * 2)
          throw new ApiError(503, 'The image pixel length is invalid.');
        return pixels;
      });
    },
  };
}
