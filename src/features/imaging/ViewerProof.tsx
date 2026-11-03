import { useEffect, useRef, useState } from 'react';
import { createViewerTransport } from './viewerTransport';
import { onContextInvalidated } from '../../shared/api/client';

import { proofOrigin } from './viewerProofConfig';
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
  const [nonce] = useState(() => crypto.randomUUID());
  const [origin] = useState(proofOrigin);
  const [status, setStatus] = useState('Connecting to the local viewer proof...');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const transport = createViewerTransport(facilityId, orderId, studyId);
    const started = performance.now();
    let rendered = false;
    let disposed = false;
    let port: MessagePort | undefined;
    const context = transport.loadContext();
    const fail = () => {
      if (disposed) return;
      setFailed(true);
      setStatus(
        'Viewer proof unavailable. Close it and retry. Manual reporting remains available.',
      );
      cleanup();
    };
    context.catch(fail);
    const timeout = setTimeout(fail, 60000);
    function cleanup() {
      if (disposed) return;
      disposed = true;
      clearTimeout(timeout);
      transport.dispose();
      port?.postMessage({ type: 'dispose' });
      port?.close();
      unsubscribe();
      window.removeEventListener('message', connect);
    }
    const unsubscribe = onContextInvalidated(fail);
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
      setStatus('Loading the verified synthetic study...');
      port.onmessage = async ({ data }) => {
        if (disposed) return;
        if (data?.type === 'frame-delivered') return;
        if (data?.type === 'rendered') {
          if (rendered) return;
          rendered = true;
          clearTimeout(timeout);
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
        } catch {
          if (!disposed) {
            port?.postMessage({ id: data.id, error: true });
            fail();
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
  return (
    <section className="viewer-proof" aria-label="Synthetic OHIF viewer proof">
      <div className="viewer-proof-header">
        <strong>OHIF 3.11.1 - synthetic proof only</strong>
        <button type="button" onClick={onClose}>
          Close viewer proof
        </button>
      </div>
      <p role={failed ? 'alert' : 'status'}>{status}</p>
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
