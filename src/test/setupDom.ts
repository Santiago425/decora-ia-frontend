import { afterEach } from 'vitest';

/**
 * Shared setup for UI tests. Component tests opt into jsdom with a
 * `@vitest-environment jsdom` docblock; plain logic tests keep running in node.
 */
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  afterEach(cleanup);

  // jsdom does not implement <dialog> yet, so mirror the open attribute the browser would toggle.
  const dialog = window.HTMLDialogElement?.prototype;
  if (dialog && !dialog.showModal) {
    dialog.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    dialog.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  }
}
