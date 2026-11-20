import { describe, expect, it } from 'vitest';
import { furnitureFactoryFor } from './furnitureFactory';
import { isoThumbnail } from './isoThumbnail';

describe('isometric thumbnail', () => {
  it('draws three faces for each box part', () => {
    const parts = furnitureFactoryFor('cabinet').createModel([1, 0.5, 1.2], '#c19a5b');
    const boxes = parts.filter((part) => part.geometry !== 'sphere').length;
    const { shapes } = isoThumbnail(parts);
    expect(shapes.filter((shape) => shape.kind === 'polygon')).toHaveLength(boxes * 3);
  });

  it('frames the drawing in a square view box', () => {
    const { viewBox } = isoThumbnail(furnitureFactoryFor('sofa').createModel([2, 0.9, 0.8], '#d8c8ae'));
    const [, , width, height] = viewBox.split(' ').map(Number);
    expect(width).toBeGreaterThan(0);
    expect(width).toBeCloseTo(height);
  });

  it('draws plants with round foliage', () => {
    const { shapes } = isoThumbnail(furnitureFactoryFor('plant').createModel([0.5, 0.5, 1.2], '#4f7a4a'));
    expect(shapes.some((shape) => shape.kind === 'ellipse')).toBe(true);
  });
});
