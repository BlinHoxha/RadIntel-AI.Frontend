import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers, resetDemo } from './mocks/handlers';
import { transferableAbortController } from 'node:util';

// Node 24's fetch/Request checks native AbortSignal identity. jsdom's signal is a
// different realm/type; use Node's pair for HTTP/router tests, never in app code.
const nativeController = transferableAbortController();
globalThis.AbortController = nativeController.constructor as typeof AbortController;
globalThis.AbortSignal = Object.getPrototypeOf(nativeController.signal)
  .constructor as typeof AbortSignal;
// jsdom does not implement native dialog opening. Actual modal/focus behavior is
// exercised by the Chromium suite; component tests only need the open state.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
}
export const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDemo();
});
afterAll(() => server.close());
