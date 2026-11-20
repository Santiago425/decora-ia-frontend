import { describe, expect, it } from 'vitest';
import { startAt } from './collections';

describe('startAt', () => {
  it('rotates the list to start at the given position', () => {
    expect(startAt(['a', 'b', 'c'], 1)).toEqual(['b', 'c', 'a']);
    expect(startAt(['a', 'b', 'c'], 4)).toEqual(['b', 'c', 'a']);
  });

  it('keeps empty lists empty', () => {
    expect(startAt([], 2)).toEqual([]);
  });
});
