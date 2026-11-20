import { describe, expect, it, vi } from 'vitest';
import { lazyWithPreload } from './lazyWithPreload';

const Page = () => null;

describe('lazyWithPreload', () => {
  it('downloads the module only once however many times it is preloaded', async () => {
    const factory = vi.fn(() => Promise.resolve({ default: Page }));
    const LazyPage = lazyWithPreload(factory);

    await Promise.all([LazyPage.preload(), LazyPage.preload()]);
    await LazyPage.preload();

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('tries again after a failed download', async () => {
    const factory = vi
      .fn<() => Promise<{ default: typeof Page }>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ default: Page });
    const LazyPage = lazyWithPreload(factory);

    await expect(LazyPage.preload()).rejects.toThrow('offline');
    await expect(LazyPage.preload()).resolves.toEqual({ default: Page });
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
