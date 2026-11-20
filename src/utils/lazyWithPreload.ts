import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type PreloadableComponent<T extends ComponentType> = LazyExoticComponent<T> & {
  preload: () => Promise<{ default: T }>;
};

/** Virtual Proxy: stands in for a page whose code is fetched the first time it is needed or announced. */
export function lazyWithPreload<T extends ComponentType>(
  factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  let pending: Promise<{ default: T }> | null = null;
  const load = () => {
    pending ??= factory().catch((error: unknown) => {
      pending = null;
      throw error;
    });
    return pending;
  };
  return Object.assign(lazy(load), { preload: load });
}
