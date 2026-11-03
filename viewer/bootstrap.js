/* Trusted child adapter for the pinned local OHIF artifact. No product credential crosses this bridge. */
(() => {
  'use strict';
  const parentOrigin = window.RADINTEL_PARENT_ORIGIN;
  const nonce = new URLSearchParams(location.hash.slice(1)).get('radintel');
  let delivered = 0;
  let channel;
  let disposed = false;
  let context;
  let nextId = 0;
  const pending = new Map();
  let readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });
  const nativeFetch = window.fetch.bind(window);
  const NativeXHR = window.XMLHttpRequest;
  // This proof never uses offline clinical storage or upstream PWA registration.
  for (const name of ['localStorage', 'sessionStorage']) {
    const storage = window[name];
    const guarded = new Proxy(storage, {
      set: () => true,
      defineProperty: () => true,
      get: (target, property) => {
        if (property === 'setItem') return () => {};
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    Object.defineProperty(window, name, { get: () => guarded });
  }
  const sendReady = () => {
    if (!channel && nonce)
      window.parent.postMessage({ type: 'radintel:ready', nonce }, parentOrigin);
  };
  const timer = setInterval(sendReady, 250);
  sendReady();
  window.addEventListener('message', (event) => {
    if (
      channel ||
      event.origin !== parentOrigin ||
      event.source !== window.parent ||
      event.data?.type !== 'radintel:init' ||
      event.data.nonce !== nonce ||
      event.ports.length !== 1
    )
      return;
    channel = event.ports[0];
    clearInterval(timer);
    channel.onmessage = ({ data }) => {
      if (data?.type === 'dispose') {
        dispose();
        return;
      }
      const waiter = pending.get(data?.id);
      if (!waiter) return;
      pending.delete(data.id);
      clearTimeout(waiter.timer);
      if (data.error) waiter.reject(new Error('The scoped image request failed.'));
      else waiter.resolve(data.value);
    };
    readyResolve();
  });
  async function rpc(operation, index) {
    await ready;
    if (disposed || pending.size >= 32) throw new Error('Viewer context unavailable.');
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error('Viewer request timed out.'));
      }, 60000);
      pending.set(id, { resolve, reject, timer: timeout });
      channel.postMessage({ id, operation, index });
    });
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    clearInterval(timer);
    context = undefined;
    pending.forEach((waiter) => {
      clearTimeout(waiter.timer);
      waiter.reject(new Error('Viewer disposed.'));
    });
    pending.clear();
    channel?.close();
    document.getElementById('root')?.replaceChildren();
  }
  window.addEventListener('pagehide', dispose);
  document.addEventListener(
    'CORNERSTONE_IMAGE_RENDERED',
    (event) => {
      const target = event.target;
      if (
        delivered &&
        !disposed &&
        target instanceof HTMLElement &&
        target.isConnected &&
        target.getBoundingClientRect().width > 32 &&
        target.getBoundingClientRect().height > 32
      )
        channel?.postMessage({ type: 'rendered' });
    },
    true,
  );
  function natural(entry, index) {
    const ct = entry.sopClassUid === '1.2.840.10008.5.1.4.1.1.2';
    return {
      metadata: {
        StudyInstanceUID: entry.studyInstanceUid,
        SeriesInstanceUID: entry.seriesInstanceUid,
        SOPInstanceUID: entry.sopInstanceUid,
        SOPClassUID: entry.sopClassUid,
        Modality: ct ? 'CT' : 'DX',
        Rows: entry.rows,
        Columns: entry.columns,
        SamplesPerPixel: 1,
        PhotometricInterpretation: 'MONOCHROME2',
        BitsAllocated: 16,
        BitsStored: 16,
        HighBit: 15,
        PixelRepresentation: 0,
        InstanceNumber: index + 1,
        ...(entry.rescaleSlope !== null ? { RescaleSlope: entry.rescaleSlope } : {}),
        ...(entry.rescaleIntercept !== null ? { RescaleIntercept: entry.rescaleIntercept } : {}),
        ...(entry.pixelSpacing ? { PixelSpacing: entry.pixelSpacing } : {}),
        ...(entry.imageOrientationPatient
          ? { ImageOrientationPatient: entry.imageOrientationPatient }
          : {}),
        ...(entry.imagePositionPatient ? { ImagePositionPatient: entry.imagePositionPatient } : {}),
      },
      url: 'dicomweb:' + location.origin + '/radintel-frame/' + index,
    };
  }
  window.fetch = async (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.origin);
    if (url.origin === location.origin && url.pathname === '/radintel-context.json') {
      context = await rpc('context');
      const groups = new Map();
      context.instances.forEach((entry, index) => {
        if (!entry.supported) return;
        const group = groups.get(entry.seriesInstanceUid) || [];
        group.push(natural(entry, index));
        groups.set(entry.seriesInstanceUid, group);
      });
      return new Response(
        JSON.stringify({
          studies: [
            {
              StudyInstanceUID: context.studyInstanceUid,
              StudyDescription: 'SYNTHETIC PROOF - NOT DIAGNOSTIC',
              series: [...groups].map(([SeriesInstanceUID, instances], index) => ({
                SeriesInstanceUID,
                SeriesNumber: index + 1,
                Modality: instances[0].metadata.Modality,
                instances,
              })),
            },
          ],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (url.origin !== location.origin && url.protocol !== 'blob:')
      throw new Error('External viewer fetch is disabled.');
    return nativeFetch(input, options);
  };
  window.XMLHttpRequest = class extends NativeXHR {
    open(method, target, ...args) {
      const url = new URL(target, location.origin);
      this.proofIndex =
        url.origin === location.origin && /^\/radintel-frame\/\d+$/.test(url.pathname)
          ? Number(url.pathname.split('/').pop())
          : undefined;
      if (this.proofIndex !== undefined) {
        this.proofState = 1;
        return;
      }
      if (url.origin !== location.origin && url.protocol !== 'blob:')
        throw new Error('External viewer request disabled.');
      return super.open(method, target, ...args);
    }
    get readyState() {
      return this.proofIndex !== undefined ? this.proofState : super.readyState;
    }
    get status() {
      return this.proofIndex !== undefined ? this.proofStatus || 0 : super.status;
    }
    get response() {
      return this.proofIndex !== undefined ? this.proofResponse : super.response;
    }
    setRequestHeader(...args) {
      if (this.proofIndex === undefined) super.setRequestHeader(...args);
    }
    getResponseHeader(name) {
      return this.proofIndex !== undefined
        ? name.toLowerCase() === 'content-type'
          ? 'application/dicom'
          : null
        : super.getResponseHeader(name);
    }
    abort() {
      if (this.proofIndex !== undefined) {
        this.proofAborted = true;
        this.dispatchEvent(new Event('abort'));
      } else super.abort();
    }
    send(...args) {
      if (this.proofIndex === undefined) return super.send(...args);
      const entry = context?.instances[this.proofIndex];
      if (!entry?.supported) {
        this.dispatchEvent(new Event('error'));
        return;
      }
      rpc('frame', this.proofIndex)
        .then(async (pixels) => {
          const { dicom } = await import('/radintel-dicom.mjs');
          if (disposed || this.proofAborted) return;
          this.proofResponse = dicom(entry, pixels);
          this.proofStatus = 200;
          this.proofState = 4;
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(
            new ProgressEvent('progress', {
              lengthComputable: true,
              loaded: pixels.byteLength,
              total: pixels.byteLength,
            }),
          );
          this.dispatchEvent(new Event('load'));
          this.dispatchEvent(new Event('loadend'));
          delivered++;
          channel.postMessage({
            type: 'frame-delivered',
            index: this.proofIndex,
            bytes: pixels.byteLength,
          });
        })
        .catch(() => {
          this.proofState = 4;
          this.proofStatus = 503;
          this.dispatchEvent(new Event('error'));
        });
    }
  };
})();
