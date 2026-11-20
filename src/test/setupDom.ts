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

  // jsdom has no layout, so scrolling is a no-op there.
  window.HTMLElement.prototype.scrollIntoView ??= function scrollIntoView() {};
  window.HTMLElement.prototype.scrollTo ??= function scrollTo() {};

  // Media queries never match in jsdom, which renders the desktop layout.
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
