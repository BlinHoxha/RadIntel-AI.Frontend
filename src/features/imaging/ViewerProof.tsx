import { useEffect, useRef, useState } from 'react';
import { createViewerTransport } from './viewerTransport';
import { ApiError, onContextInvalidated } from '../../shared/api/client';
import {
  displayContext,
  formatPosition,
  formatSpacing,
  planViewer,
  type PlannedImage,
  type ViewerPlan,
} from './geometry';

import { proofOrigin } from './viewerProofConfig';
const UNAVAILABLE =
  'Viewer proof unavailable. Close it and retry. Manual reporting remains available.';
const UNVERIFIED =
  'Viewer unavailable: the image identity or format could not be verified. Manual reporting remains available.';
const FORMAT =
  'Image could not be shown: unsupported image format or image service unavailable. Manual reporting remains available.';
const NO_IMAGES = 'No supported images to show in this study. Manual reporting remains available.';
// Owner-approved M07 tools (12 November 2026): no presets, angle or region of interest.
const TOOLS = [
  { id: 'WindowLevel', label: 'Window/level' },
  { id: 'Zoom', label: 'Zoom' },
  { id: 'Pan', label: 'Pan' },
  { id: 'Length', label: 'Length' },
] as const;
type Tool = (typeof TOOLS)[number]['id'];
interface Measurement {
  index: number;
  length: number;
  unit: string;
}
class NoDisplayableImages extends Error {}
class FrameUnavailable extends Error {}
export default function ViewerProof({
  facilityId,
  orderId,
  studyId,
  onClose,
}: {
  facilityId: string;
  orderId: string;
  studyId: string;
  onClose: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const portRef = useRef<MessagePort | undefined>(undefined);
  const [nonce] = useState(() => crypto.randomUUID());
  const [origin] = useState(proofOrigin);
  const [status, setStatus] = useState('Connecting to the local viewer proof...');
  const [failed, setFailed] = useState(false);
  const [plan, setPlan] = useState<ViewerPlan>();
  const [shown, setShown] = useState<number>();
  const [notice, setNotice] = useState('');
  const [tool, setTool] = useState<Tool>('WindowLevel');
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  useEffect(() => {
    const transport = createViewerTransport(facilityId, orderId, studyId);
    const started = performance.now();
    let rendered = false;
    let disposed = false;
    let port: MessagePort | undefined;
    const context = transport.loadContext().then((checked) => {
      const planned = planViewer(checked);
      if (!planned.images.length) throw new NoDisplayableImages();
      if (!disposed) setPlan(planned);
      return displayContext(checked, planned);
    });
    const fail = (error?: unknown) => {
      if (disposed) return;
      setFailed(true);
      setStatus(
        error instanceof NoDisplayableImages
          ? NO_IMAGES
          : error instanceof FrameUnavailable
            ? FORMAT
            : error instanceof ApiError && error.status === 503 && contextFailed
              ? UNVERIFIED
              : UNAVAILABLE,
      );
      cleanup();
    };
    let contextFailed = false;
    context.catch((error) => {
      contextFailed = true;
      fail(error);
    });
    const timeout = setTimeout(fail, 60000);
    function cleanup() {
      if (disposed) return;
      disposed = true;
      clearTimeout(timeout);
      transport.dispose();
      port?.postMessage({ type: 'dispose' });
      port?.close();
      portRef.current = undefined;
      unsubscribe();
      window.removeEventListener('message', connect);
    }
    const unsubscribe = onContextInvalidated(() => fail());
    function connect(event: MessageEvent) {
      if (
        disposed ||
        port ||
        event.origin !== origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== 'radintel:ready' ||
        event.data.nonce !== nonce
      )
        return;
      const pair = new MessageChannel();
      port = pair.port1;
      portRef.current = port;
      setStatus('Loading the verified synthetic study...');
      port.onmessage = async ({ data }) => {
        if (disposed) return;
        if (data?.type === 'frame-delivered') return;
        if (data?.type === 'displayed' || data?.type === 'navigate-failed') {
          const checked = await context.catch(() => undefined);
          if (disposed || !checked) return;
          if (
            !Number.isInteger(data.index) ||
            data.index < 0 ||
            data.index >= checked.instances.length
          )
            return;
          if (data.type === 'displayed') {
            setShown(data.index);
            setNotice('');
          } else
            setNotice('Navigation unavailable for that image. The current image is unchanged.');
          return;
        }
        if (data?.type === 'tool-selected' || data?.type === 'tool-refused') {
          const known = TOOLS.find((item) => item.id === data.tool);
          if (!known) return;
          if (data.type === 'tool-selected') setTool(known.id);
          else setNotice('Measurement unavailable: pixel spacing missing');
          return;
        }
        if (data?.type === 'view-reset') return;
        if (data?.type === 'measurement') {
          const checked = await context.catch(() => undefined);
          if (disposed || !checked) return;
          const value = data.value;
          const valid =
            value &&
            Number.isInteger(value.index) &&
            value.index >= 0 &&
            value.index < checked.instances.length &&
            Number.isFinite(value.length) &&
            typeof value.unit === 'string';
          setMeasurement(
            valid ? { index: value.index, length: value.length, unit: value.unit } : null,
          );
          return;
        }
        if (data?.type === 'rendered') {
          if (rendered) return;
          rendered = true;
          clearTimeout(timeout);
          // Start at planned slice 1 of series 1, whatever image OHIF chose to show first.
          port?.postMessage({ type: 'navigate', index: 0 });
          setStatus('Synthetic frame rendered - not for diagnostic use.');
          frame.current?.setAttribute('data-rendered', 'true');
          frame.current?.setAttribute(
            'data-first-frame-ms',
            String(Math.round(performance.now() - started)),
          );
          return;
        }
        if (!Number.isSafeInteger(data?.id) || data.id <= 0) {
          fail();
          return;
        }
        try {
          const checked = await context;
          if (disposed) return;
          if (data.operation === 'context') port?.postMessage({ id: data.id, value: checked });
          else if (
            data.operation === 'frame' &&
            Number.isInteger(data.index) &&
            data.index >= 0 &&
            data.index < checked.instances.length
          ) {
            const pixels = await transport.frame(checked.instances[data.index].sopInstanceUid);
            if (!disposed) port?.postMessage({ id: data.id, value: pixels }, [pixels]);
          } else throw new Error('Invalid scoped viewer operation.');
        } catch (error) {
          if (!disposed) {
            port?.postMessage({ id: data.id, error: true });
            // The backend rejects an unsupported transfer syntax only when pixels are requested and
            // reports it as 503, the same status as an unavailable image service.
            fail(
              data.operation === 'frame' && error instanceof ApiError && error.status === 503
                ? new FrameUnavailable()
                : undefined,
            );
          }
        }
      };
      frame.current?.contentWindow?.postMessage({ type: 'radintel:init', nonce }, origin, [
        pair.port2,
      ]);
    }
    window.addEventListener('message', connect);
    return cleanup;
  }, [facilityId, orderId, studyId, nonce, origin]);
  const current: PlannedImage | undefined = shown === undefined ? undefined : plan?.images[shown];
  const series = current && plan?.series[current.seriesNumber - 1];
  const choose = (id: Tool) => {
    setNotice('');
    portRef.current?.postMessage({ type: 'tool', tool: id });
  };
  // The readout describes only the image on screen: a length taken on another image is never
  // shown next to an image it does not belong to (RI-M07C review finding).
  const measuredImage = measurement ? plan?.images[measurement.index] : undefined;
  const measurementText = !current?.pixelSpacing
    ? 'Measurement unavailable: pixel spacing missing'
    : !measurement || measurement.index !== current.displayIndex
      ? 'No measurement on this image. Select Length and drag on the image.'
      : measurement.unit === 'mm' && measuredImage?.pixelSpacing
        ? 'Length: ' +
          measurement.length.toFixed(1) +
          ' mm on image ' +
          measuredImage.sopInstanceUid
        : 'Measurement unavailable: pixel spacing missing';
  const navigate = (image: PlannedImage | undefined) => {
    if (!image) return;
    setNotice('');
    portRef.current?.postMessage({ type: 'navigate', index: image.displayIndex });
  };
  return (
    <section className="viewer-proof" aria-label="Synthetic OHIF viewer proof">
      <div className="viewer-proof-header">
        <strong>OHIF 3.11.1 - synthetic proof only</strong>
        <button type="button" onClick={onClose}>
          Close viewer proof
        </button>
      </div>
      <p role={failed ? 'alert' : 'status'}>{status}</p>
      {!failed &&
        plan &&
        (plan.warnings.length > 0 || plan.series.some((s) => s.warnings.length)) && (
          <ul aria-label="Viewer warnings" className="viewer-warnings">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
            {plan.series.flatMap((s) =>
              s.warnings.map((warning) => (
                <li key={s.number + warning}>{'Series ' + s.number + ': ' + warning}</li>
              )),
            )}
          </ul>
        )}
      {!failed && plan && (
        <div className="viewer-navigation" aria-label="Viewer navigation" role="group">
          <label>
            Series
            <select
              value={current?.seriesNumber ?? ''}
              disabled={current === undefined}
              onChange={(event) => navigate(plan.series[Number(event.target.value) - 1]?.images[0])}
            >
              {current === undefined && <option value="">Loading…</option>}
              {plan.series.map((s) => (
                <option key={s.seriesInstanceUid} value={s.number}>
                  {'Series ' +
                    s.number +
                    ' (' +
                    s.images.length +
                    (s.images.length === 1 ? ' image)' : ' images)')}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!current || !series || current.slice <= 1}
            onClick={() => navigate(series?.images[current!.slice - 2])}
          >
            Previous slice
          </button>
          <button
            type="button"
            disabled={!current || !series || current.slice >= current.sliceCount}
            onClick={() => navigate(series?.images[current!.slice])}
          >
            Next slice
          </button>
        </div>
      )}
      {!failed && current && (
        <>
          <div className="viewer-navigation" aria-label="Viewer tools" role="group">
            {TOOLS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tool === item.id}
                disabled={item.id === 'Length' && !current.pixelSpacing}
                onClick={() => choose(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button type="button" onClick={() => portRef.current?.postMessage({ type: 'reset' })}>
              Reset view
            </button>
          </div>
          <p data-testid="viewer-measurement">{measurementText}</p>
        </>
      )}
      {!failed && current && (
        <dl aria-label="Displayed image" className="viewer-identity">
          <dt>Series</dt>
          <dd data-testid="viewer-series">{current.seriesInstanceUid}</dd>
          <dt>Image</dt>
          <dd data-testid="viewer-image">{current.sopInstanceUid}</dd>
          <dt>Slice</dt>
          <dd data-testid="viewer-slice">
            {current.slice +
              ' of ' +
              current.sliceCount +
              (current.orderVerified ? '' : ' (order unverified)')}
          </dd>
          <dt>Position</dt>
          <dd data-testid="viewer-position">{formatPosition(current.position)}</dd>
          <dt>Orientation</dt>
          <dd data-testid="viewer-orientation">
            {current.orientation
              ? 'Left ' +
                current.orientation.left +
                ', right ' +
                current.orientation.right +
                ', top ' +
                current.orientation.top +
                ', bottom ' +
                current.orientation.bottom
              : 'Orientation unavailable'}
          </dd>
          <dt>Pixel spacing</dt>
          <dd data-testid="viewer-spacing">{formatSpacing(current.pixelSpacing)}</dd>
        </dl>
      )}
      {notice && <p role="alert">{notice}</p>}
      {!failed && (
        <iframe
          ref={frame}
          title="Synthetic OHIF viewer"
          src={origin + '/viewer/dicomjson?url=/radintel-context.json#radintel=' + nonce}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
        />
      )}
      <p>
        Limited raw-16 images. Viewing tools, geometry and measurements have not received clinical
        acceptance.
      </p>
    </section>
  );
}
