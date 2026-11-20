import { describe, expect, it, vi } from 'vitest';
import { patternMode } from './patternMode';

describe('patternMode', () => {
  it('notifies subscribers only when the switch actually changes', () => {
    const listener = vi.fn();
    const unsubscribe = patternMode.subscribe(listener);
    patternMode.set(false);
    patternMode.toggle();
    patternMode.set(true);
    expect(listener).toHaveBeenCalledOnce();
    expect(patternMode.isEnabled()).toBe(true);
    unsubscribe();
    patternMode.toggle();
    expect(listener).toHaveBeenCalledOnce();
  });
});
