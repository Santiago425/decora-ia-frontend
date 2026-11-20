import type { RoomData, SceneNodeData } from '../types/project';
import { flattenItems, itemBounds, type Bounds } from './sceneTree';

export interface WallGaps {
  left: number;
  right: number;
  back: number;
  front: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Free space between a footprint and each wall, in meters (negative when it pokes through the wall). */
export function wallGaps(bounds: Bounds, room: Pick<RoomData, 'width' | 'length'>): WallGaps {
  const halfW = room.width / 2;
  const halfL = room.length / 2;
  return {
    left: round(bounds.minX + halfW),
    right: round(halfW - bounds.maxX),
    back: round(bounds.minZ + halfL),
    front: round(halfL - bounds.maxZ),
  };
}

/** Move that pushes a footprint flat against its closest wall, keeping the other axis as it is. */
export function wallSnapOffset(bounds: Bounds, room: Pick<RoomData, 'width' | 'length'>): [number, number] {
  const gaps = wallGaps(bounds, room);
  const moves: [number, number, number][] = [
    [gaps.left, -gaps.left, 0],
    [gaps.right, gaps.right, 0],
    [gaps.back, 0, -gaps.back],
    [gaps.front, 0, gaps.front],
  ];
  const [, dx, dz] = moves.reduce((best, move) => (move[0] < best[0] ? move : best));
  return [dx + 0, dz + 0];
}

const footprints = (node: SceneNodeData, minHeight: number) =>
  (node.kind === 'group' ? flattenItems(node.children) : [node])
    .filter((item) => item.size[2] > minHeight)
    .map(itemBounds);

const intersects = (a: Bounds, b: Bounds, tolerance: number) =>
  a.minX + tolerance < b.maxX &&
  a.maxX - tolerance > b.minX &&
  a.minZ + tolerance < b.maxZ &&
  a.maxZ - tolerance > b.minZ;

/**
 * Top-level nodes whose furniture overlaps another node. Flat pieces such as rugs are ignored,
 * and pieces inside the same group never count as a clash with each other.
 */
export function overlappingIds(nodes: SceneNodeData[], tolerance: number, minHeight = 0.05): Set<string> {
  const shapes = nodes.map((node) => ({ id: node.id, bounds: footprints(node, minHeight) }));
  const clashing = new Set<string>();
  shapes.forEach((a, i) => {
    for (const b of shapes.slice(i + 1)) {
      if (a.bounds.some((x) => b.bounds.some((y) => intersects(x, y, tolerance)))) {
        clashing.add(a.id);
        clashing.add(b.id);
      }
    }
  });
  return clashing;
}
