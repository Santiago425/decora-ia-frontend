import { describe, expect, it, vi } from 'vitest';
import { pages, preloadRoute } from './pages';

describe('preloadRoute', () => {
  it('maps a project editor link to the editor page', () => {
    const spy = vi.spyOn(pages.editor, 'preload').mockReturnValue(new Promise(() => undefined));
    preloadRoute('/editor/42');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('ignores paths without a page', () => {
    const spies = Object.values(pages).map((page) => vi.spyOn(page, 'preload'));
    preloadRoute('/unknown');
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});
