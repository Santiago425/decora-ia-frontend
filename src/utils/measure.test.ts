import { describe, expect, it } from 'vitest';
import { clamp, parseFloorSizes, parseMeasure, resizeRange } from './measure';

describe('measure helpers', () => {
  it('parses floor size presets and skips broken ones', () => {
    expect(parseFloorSizes(['3x3', '4X3.5', 'grande', '0x2', '5x'])).toEqual([
      [3, 3],
      [4, 3.5],
    ]);
  });

  it('limits a furniture side around its catalog size', () => {
    expect(resizeRange(2, [0.5, 2], { min: 0.05, max: 10 })).toEqual({ min: 1, max: 4 });
    expect(resizeRange(6, [0.5, 2], { min: 0.05, max: 10 })).toEqual({ min: 3, max: 10 });
    expect(resizeRange(0.02, [0.5, 2], { min: 0.05, max: 10 })).toEqual({ min: 0.05, max: 0.05 });
  });

  it('clamps and parses typed values', () => {
    expect(clamp(12, { min: 1, max: 4 })).toBe(4);
    expect(parseMeasure(' 1,256 ')).toBe(1.26);
    expect(parseMeasure('abc')).toBeNull();
    expect(parseMeasure('')).toBeNull();
  });
});
