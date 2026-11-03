import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/setup';
import {
  changeContext,
  clearCredentials,
  requestBinary,
  setCredentials,
} from '../../shared/api/client';
import { createViewerTransport } from './viewerTransport';

const facility = '10000000-0000-4000-8000-000000000001';
const order = '10000000-0000-4000-8000-000000000002';
const study = '10000000-0000-4000-8000-000000000003';
const base = '/api/v1/facilities/' + facility;
const contextPath = base + '/imaging-orders/' + order + '/viewer-context';
const framePath = base + '/studies/' + study + '/viewer-frames';
const pixels = new Uint8Array([0, 0, 1, 0, 0, 1, 255, 255]);
const entry = {
  studyInstanceUid: '1.2.3',
  seriesInstanceUid: '1.2.3.1',
  sopInstanceUid: '1.2.3.1.1',
  sopClassUid: '1.2.840.10008.5.1.4.1.1.2',
  rows: 2,
  columns: 2,
  frames: 1,
  bitsAllocated: 16,
  bitsStored: 16,
  highBit: 15,
  pixelRepresentation: 0,
  photometricInterpretation: 'MONOCHROME2',
  samplesPerPixel: 1,
  rescaleSlope: 1,
  rescaleIntercept: -1024,
  pixelSpacing: [0.5, 0.5],
  imageOrientationPatient: [1, 0, 0, 0, 1, 0],
  imagePositionPatient: [0, 0, 1],
  supported: true,
  unsupportedReason: null,
  metadataHash: 'A'.repeat(64),
};
const context = {
  contractVersion: 1,
  studyId: study,
  studyInstanceUid: '1.2.3',
  support: 'LimitedRaw16Proof',
  instances: [entry],
};
function setup() {
  setCredentials('synthetic-demo', () => {});
  server.use(http.post(contextPath, () => HttpResponse.json(context)));
  return createViewerTransport(facility, order, study);
}
afterEach(() => {
  clearCredentials();
  vi.restoreAllMocks();
});
describe('scoped viewer transport', () => {
  it('preserves known little-endian pixels and sends only checked identity/hash through authenticated POST', async () => {
    const viewer = setup();
    let seen: unknown;
    server.use(
      http.post(framePath, async ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer synthetic-demo');
        seen = await request.json();
        return new HttpResponse(pixels, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      }),
    );
    const result = await viewer.loadContext();
    result.instances[0].rows = 999; // Caller cannot mutate retained context.
    expect(new Uint8Array(await viewer.frame(entry.sopInstanceUid))).toEqual(pixels);
    expect(seen).toEqual({
      seriesInstanceUid: entry.seriesInstanceUid,
      sopInstanceUid: entry.sopInstanceUid,
      frameNumber: 1,
      expectedMetadataHash: entry.metadataHash,
    });
    viewer.dispose();
  });
  it('rejects unlisted instances and mismatched context before fetching pixels', async () => {
    const viewer = setup();
    await viewer.loadContext();
    await expect(viewer.frame('9.9')).rejects.toMatchObject({ status: 503 });
    server.use(http.post(contextPath, () => HttpResponse.json({ ...context, studyId: order })));
    await expect(viewer.loadContext()).rejects.toMatchObject({ status: 503 });
    viewer.dispose();
  });
  it('clears context on facility change and never reuses it', async () => {
    const viewer = setup();
    await viewer.loadContext();
    changeContext();
    await expect(viewer.frame(entry.sopInstanceUid)).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('cancels in-flight frame reads on dispose', async () => {
    const viewer = setup();
    await viewer.loadContext();
    let arrived!: () => void;
    const ready = new Promise<void>((resolve) => {
      arrived = resolve;
    });
    server.use(
      http.post(framePath, async ({ request }) => {
        arrived();
        await new Promise<void>((resolve) =>
          request.signal.addEventListener('abort', () => resolve(), { once: true }),
        );
        return new HttpResponse(pixels, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      }),
    );
    const pending = viewer.frame(entry.sopInstanceUid);
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await ready;
    viewer.dispose();
    await rejected;
  });
  it.each([401, 403, 409])(
    'disposes a context on status %s without exposing upstream detail',
    async (status) => {
      const viewer = setup();
      await viewer.loadContext();
      server.use(
        http.post(framePath, () =>
          HttpResponse.json({ detail: 'PRIVATE ARCHIVE TEXT' }, { status }),
        ),
      );
      const error = await viewer.frame(entry.sopInstanceUid).catch((e: Error) => e);
      expect(error).toMatchObject({ status });
      expect((error as Error).message).not.toContain('PRIVATE');
      await expect(viewer.frame(entry.sopInstanceUid)).rejects.toMatchObject({
        name: 'AbortError',
      });
    },
  );
  it.each(['application/json', 'multipart/related'])(
    'rejects unexpected binary media type %s',
    async (type) => {
      const viewer = setup();
      await viewer.loadContext();
      server.use(
        http.post(framePath, () => new HttpResponse(pixels, { headers: { 'Content-Type': type } })),
      );
      await expect(viewer.frame(entry.sopInstanceUid)).rejects.toMatchObject({ status: 503 });
      viewer.dispose();
    },
  );
  it('rejects truncated and oversized frames', async () => {
    const viewer = setup();
    await viewer.loadContext();
    server.use(
      http.post(
        framePath,
        () =>
          new HttpResponse(new Uint8Array([1, 2]), {
            headers: { 'Content-Type': 'application/octet-stream' },
          }),
      ),
    );
    await expect(viewer.frame(entry.sopInstanceUid)).rejects.toMatchObject({ status: 503 });
    server.use(
      http.post(
        framePath,
        () =>
          new HttpResponse(pixels, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': String(16 * 1024 * 1024 + 1),
            },
          }),
      ),
    );
    await expect(viewer.frame(entry.sopInstanceUid)).rejects.toMatchObject({ status: 503 });
    viewer.dispose();
  });
  it('limits parallel reads to two and drains its queue', async () => {
    const viewer = setup();
    await viewer.loadContext();
    let active = 0;
    let peak = 0;
    server.use(
      http.post(framePath, async () => {
        active++;
        peak = Math.max(active, peak);
        await new Promise((resolve) => setTimeout(resolve, 10));
        active--;
        return new HttpResponse(pixels, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      }),
    );
    await Promise.all(Array.from({ length: 7 }, () => viewer.frame(entry.sopInstanceUid)));
    expect(peak).toBe(2);
    viewer.dispose();
  });
  it('rejects a context change while the binary body is still arriving', async () => {
    setCredentials('synthetic-demo', () => {});
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              setTimeout(() => {
                controller.enqueue(pixels);
                changeContext();
                controller.close();
              }, 0);
            },
          }),
          { headers: { 'Content-Type': 'application/octet-stream' } },
        ),
    );
    await expect(requestBinary('synthetic-frame', {})).rejects.toMatchObject({ status: 401 });
    expect(mock).toHaveBeenCalledOnce();
  });
});
