import { describe, expect, it } from 'vitest';
import type { SceneItemData, SceneNodeData } from '../types/project';
import { overlappingIds, wallGaps } from './layoutGuides';

const item = (id: string, x: number, z: number, size: [number, number, number] = [1, 1, 0.8]): SceneItemData => ({
  kind: 'item',
  id,
  furniture_id: 1,
  name: id,
  category: 'sofa',
  shape: 'sofa',
  position: [x, z],
  rotation: 0,
  size,
  color: '#aaaaaa',
  price: 100,
  finish: null,
  addons: [],
});

describe('wallGaps', () => {
  it('measures the free space to every wall', () => {
    const gaps = wallGaps({ minX: -1, maxX: 0.5, minZ: 1, maxZ: 1.5 }, { width: 4, length: 3 });
    expect(gaps).toEqual({ left: 1, right: 1.5, back: 2.5, front: 0 });
  });
});

describe('overlappingIds', () => {
  it('flags both pieces that clash', () => {
    const ids = overlappingIds([item('a', 0, 0), item('b', 0.5, 0), item('c', 3, 3)], 0.02);
    expect([...ids].sort()).toEqual(['a', 'b']);
  });

  it('ignores pieces that only touch within the tolerance', () => {
    expect(overlappingIds([item('a', 0, 0), item('b', 0.99, 0)], 0.02).size).toBe(0);
  });

  it('ignores flat pieces like rugs', () => {
    expect(overlappingIds([item('rug', 0, 0, [3, 2, 0.02]), item('sofa', 0, 0)], 0.02).size).toBe(0);
  });

  it('reports the group, not its children, and never a clash inside the group', () => {
    const group: SceneNodeData = {
      kind: 'group',
      id: 'g',
      name: 'Grupo',
      children: [item('a', 0, 0), item('b', 0.5, 0)],
    };
    expect(overlappingIds([group], 0.02).size).toBe(0);
    expect([...overlappingIds([group, item('c', 1, 0)], 0.02)].sort()).toEqual(['c', 'g']);
  });
});
