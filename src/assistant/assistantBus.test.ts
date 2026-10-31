import { describe, expect, it } from 'vitest';
import { assistantBus } from './assistantBus';

describe('assistantBus', () => {
  it('reports whether any subscriber handled the action', () => {
    const seen: string[] = [];
    const unsubscribe = assistantBus.subscribe((action) => {
      seen.push(action.type);
      return action.type === 'undo';
    });

    expect(assistantBus.publish({ type: 'undo', params: {} })).toBe(true);
    expect(assistantBus.publish({ type: 'redo', params: {} })).toBe(false);
    unsubscribe();
    expect(assistantBus.publish({ type: 'undo', params: {} })).toBe(false);
    expect(seen).toEqual(['undo', 'redo']);
  });
});
