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
      if (data?.type === 'navigate') {
        navigate(data.index);
        return;
      }
      if (data?.type === 'tool') {
        selectTool(data.tool);
        return;
      }
      if (data?.type === 'reset') {
        resetView();
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
    clearInterval(watcher);
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
  const frameUrl = (index) => 'dicomweb:' + location.origin + '/radintel-frame/' + index;
  const frameIndex = (imageId) => {
    const match = /\/radintel-frame\/(\d+)(?:$|[?&#/])/.exec(String(imageId || ''));
    return match ? Number(match[1]) : undefined;
  };
  let shown;
  // Reports the image on the main viewport so the parent labels it from its own checked
  // metadata. Polling avoids OHIF thumbnail viewports, which emit the same render events.
  // M07C: only owner-approved interactions. OHIF's toolbar, side panels and keyboard shortcuts
  // are removed; the parent's controls select tools. Relies on pinned OHIF 3.11.1 internals:
  // cornerstoneTools.ToolGroupManager ('default' group), annotation.state and viewport APIs.
  const APPROVED_TOOLS = ['WindowLevel', 'Zoom', 'Pan', 'Length'];
  const KEEP_ENABLED = new Set([...APPROVED_TOOLS, 'StackScroll', 'ImageOverlayViewer']);
  const chrome = document.createElement('style');
  chrome.textContent = [
    '#root > div > div:has([data-cy="return-to-work-list"]),',
    '#viewerLayoutResizableLeftPanel, #viewerLayoutResizableRightPanel,',
    '[data-panel-resize-handle-id] { display: none !important; }',
  ].join('\n');
  document.head.appendChild(chrome);
  // OHIF hotkeys could activate unapproved tools; all keyboard input stays with the parent.
  for (const type of ['keydown', 'keyup', 'keypress'])
    window.addEventListener(type, (event) => event.stopImmediatePropagation(), true);
  let toolsReady = false;
  let primaryTool = 'WindowLevel';
  const toolGroup = () => window.cornerstoneTools?.ToolGroupManager?.getToolGroup?.('default');
  function configureTools() {
    const group = toolGroup();
    if (toolsReady || !group) return;
    for (const name of Object.keys(group.toolOptions || {}))
      if (!KEEP_ENABLED.has(name)) group.setToolDisabled(name);
    toolsReady = true;
    selectTool('WindowLevel');
    window.cornerstone?.getRenderingEngines?.().forEach((engine) => engine.resize(true, true));
  }
  function currentEntry() {
    const index = currentFrame();
    return index === undefined ? undefined : context?.instances[index];
  }
  function selectTool(name) {
    const group = toolGroup();
    if (disposed || !group || !APPROVED_TOOLS.includes(name)) return;
    if (name === 'Length' && !currentEntry()?.pixelSpacing) {
      channel?.postMessage({ type: 'tool-refused', tool: name });
      return;
    }
    const active = group.getActivePrimaryMouseButtonTool?.();
    if (active && active !== name) group.setToolPassive(active);
    group.setToolActive(name, { bindings: [{ mouseButton: 1 }] });
    primaryTool = name;
    channel?.postMessage({ type: 'tool-selected', tool: name });
  }
  function resetView() {
    for (const viewport of stackViewports()) {
      viewport.resetCamera?.();
      viewport.resetProperties?.();
      viewport.render?.();
    }
    channel?.postMessage({ type: 'view-reset' });
  }
  let measured = '';
  // Reports the most recent Length annotation; measurements live only in this child's memory.
  function reportMeasurement() {
    const all = window.cornerstoneTools?.annotation?.state?.getAllAnnotations?.() || [];
    const lengths = all.filter((item) => item.metadata?.toolName === 'Length');
    const last = lengths[lengths.length - 1];
    const imageId = last?.metadata?.referencedImageId;
    const stats = imageId ? last.data?.cachedStats?.['imageId:' + imageId] : undefined;
    const index = frameIndex(imageId);
    const value =
      stats && Number.isFinite(stats.length) && index !== undefined && context?.instances[index]
        ? { index, length: Math.round(stats.length * 10) / 10, unit: String(stats.unit) }
        : null;
    const key = JSON.stringify([lengths.length, value]);
    if (key === measured) return;
    measured = key;
    channel?.postMessage({ type: 'measurement', count: lengths.length, value });
  }
  let renderedSent = false;
  const watcher = setInterval(() => {
    if (disposed) return;
    try {
      if (delivered) {
        configureTools();
        reportMeasurement();
      }
      // If navigation lands on an image without spacing, length measurement is withdrawn.
      if (toolsReady && primaryTool === 'Length' && !currentEntry()?.pixelSpacing)
        selectTool('WindowLevel');
      // Fallback for the render signal: OHIF does not always deliver its render event to the
      // document, so a sized main viewport holding image data also counts as rendered.
      if (!renderedSent && delivered) {
        const viewport = stackViewports()[0];
        const box = viewport?.element?.getBoundingClientRect();
        if (viewport?.getImageData?.() && box && box.width > 32 && box.height > 32) {
          renderedSent = true;
          channel?.postMessage({ type: 'rendered' });
        }
      }
      const index = delivered ? currentFrame() : undefined;
      if (index === undefined || index === shown || !context?.instances[index]) return;
      shown = index;
      channel?.postMessage({ type: 'displayed', index });
    } catch {
      // Labels stay on the last confirmed image; the parent never infers identity.
    }
  }, 200);
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
      ) {
        channel?.postMessage({ type: 'rendered' });
      }
    },
    true,
  );
  function stackViewports() {
    const engines = window.cornerstone?.getRenderingEngines?.() || [];
    // Thumbnail viewports have no image list; only the main stack viewport counts.
    return engines
      .flatMap((engine) => engine.getViewports())
      .filter((v) => v.getImageIds && v.getImageIds().length > 0);
  }
  // OHIF may wrap our frame URL in its own image-ID scheme, so match on the frame index.
  function showFrame(index) {
    for (const viewport of stackViewports()) {
      const position = viewport.getImageIds().findIndex((id) => frameIndex(id) === index);
      if (position >= 0) {
        viewport.setImageIdIndex(position);
        return true;
      }
    }
    return false;
  }
  // Parent-driven navigation within the scoped context only: same-series slice changes use the
  // stack; a series change loads that series' display set into the active viewport first.
  function currentFrame() {
    for (const viewport of stackViewports()) {
      const index = frameIndex(viewport.getCurrentImageId?.());
      if (index !== undefined) return index;
    }
    return undefined;
  }
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let navigation = 0;
  // OHIF can reset its stack shortly after loading, so a request is re-applied until the target
  // stays on screen for a settling window. A newer request supersedes an older one.
  async function navigate(index) {
    const entry = Number.isInteger(index) ? context?.instances[index] : undefined;
    if (disposed || !entry) return;
    const generation = ++navigation;
    const deadline = Date.now() + 10000;
    let switched = false;
    let lastAttempt = 0;
    let stableSince;
    try {
      while (!disposed && generation === navigation) {
        const now = Date.now();
        if (currentFrame() === index) {
          stableSince ??= now;
          if (now - stableSince >= 1500) return;
        } else {
          stableSince = undefined;
          if (now > deadline) throw new Error('Navigation timed out.');
          if (now - lastAttempt >= 1000 && !showFrame(index) && !switched) {
            const services = window.services;
            const displaySet = services?.displaySetService
              ?.getActiveDisplaySets()
              .find((set) => set.SeriesInstanceUID === entry.seriesInstanceUid);
            if (!displaySet) throw new Error('Series unavailable.');
            services.viewportGridService.setDisplaySetsForViewport({
              viewportId: services.viewportGridService.getActiveViewportId(),
              displaySetInstanceUIDs: [displaySet.displaySetInstanceUID],
            });
            switched = true;
          }
          if (now - lastAttempt >= 1000) lastAttempt = now;
        }
        await pause(100);
      }
    } catch {
      if (!disposed && generation === navigation)
        channel?.postMessage({ type: 'navigate-failed', index });
    }
  }
  function natural(entry, index, number) {
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
        InstanceNumber: number,
        ...(entry.rescaleSlope !== null ? { RescaleSlope: entry.rescaleSlope } : {}),
        ...(entry.rescaleIntercept !== null ? { RescaleIntercept: entry.rescaleIntercept } : {}),
        ...(entry.pixelSpacing ? { PixelSpacing: entry.pixelSpacing } : {}),
        ...(entry.imageOrientationPatient
          ? { ImageOrientationPatient: entry.imageOrientationPatient }
          : {}),
        ...(entry.imagePositionPatient ? { ImagePositionPatient: entry.imagePositionPatient } : {}),
      },
      url: frameUrl(index),
    };
  }
  window.fetch = async (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.origin);
    if (url.origin === location.origin && url.pathname === '/radintel-context.json') {
      context = await rpc('context');
      const groups = new Map();
      // The parent sends displayable instances only, grouped by series in verified order.
      context.instances.forEach((entry, index) => {
        if (!entry.supported) return;
        const group = groups.get(entry.seriesInstanceUid) || [];
        group.push(natural(entry, index, group.length + 1));
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
