import { describe, expect, it } from 'vitest';
import { assistantBus } from './assistantBus';

describe('assistantBus', () => {
  it('reports the best outcome among the subscribers', () => {
    const seen: string[] = [];
    const stopFirst = assistantBus.subscribe((action) => {
      seen.push(action.type);
      return action.type === 'undo' ? 'done' : 'ignored';
    });
    const stopSecond = assistantBus.subscribe((action) => (action.type === 'redo' ? 'blocked' : 'ignored'));

    expect(assistantBus.publish({ type: 'undo', params: {} })).toBe('done');
    expect(assistantBus.publish({ type: 'redo', params: {} })).toBe('blocked');
    expect(assistantBus.publish({ type: 'navigate', params: {} })).toBe('ignored');
    stopFirst();
    stopSecond();
    expect(assistantBus.publish({ type: 'undo', params: {} })).toBe('ignored');
    expect(seen).toEqual(['undo', 'redo', 'navigate']);
  });
});
