import { describe, expect, it, vi } from 'vitest';
import { assistantBus } from './assistantBus';
import { pageContextFor } from './pageContext';

describe('assistant page context', () => {
  it('detects the page and the open project', () => {
    expect(pageContextFor('/')).toEqual({ page: 'dashboard' });
    expect(pageContextFor('/redesign')).toEqual({ page: 'redesign' });
    expect(pageContextFor('/editor')).toEqual({ page: 'editor' });
    expect(pageContextFor('/editor/abc-123')).toEqual({ page: 'editor', project_id: 'abc-123' });
    expect(pageContextFor('/unknown')).toEqual({ page: 'dashboard' });
  });
});

describe('assistant bus', () => {
  it('delivers actions to every subscriber and reports if one handled it', () => {
    const editor = vi.fn(() => 'ignored' as const);
    const router = vi.fn(() => 'done' as const);
    const offEditor = assistantBus.subscribe(editor);
    const offRouter = assistantBus.subscribe(router);
    expect(assistantBus.publish({ type: 'navigate', params: { to: 'docs' } })).toBe('done');
    expect(editor).toHaveBeenCalledOnce();
    offEditor();
    offRouter();
    expect(assistantBus.publish({ type: 'undo', params: {} })).toBe('ignored');
  });
});
