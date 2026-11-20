import { describe, expect, it, vi } from 'vitest';
import { pages, preloadRoute } from './pages';

describe('preloadRoute', () => {
  it('maps a project editor link to the editor page', () => {
    const spy = vi.spyOn(pages.editor, 'preload').mockReturnValue(new Promise(() => undefined));
    preloadRoute('/editor/42');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('ignores the query string of a link', () => {
    const spy = vi.spyOn(pages.redesign, 'preload').mockReturnValue(new Promise(() => undefined));
    preloadRoute('/redesign?project=42');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('ignores paths without a page', () => {
    const spies = Object.values(pages).map((page) => vi.spyOn(page, 'preload'));
    preloadRoute('/unknown');
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe('preloadRoute for the shopping list', () => {
  it('maps a project shopping list link to its page', () => {
    const spy = vi.spyOn(pages.shoppingList, 'preload').mockReturnValue(new Promise(() => undefined));
    preloadRoute('/projects/42/shopping-list');
    expect(spy).toHaveBeenCalledOnce();
  });
});
