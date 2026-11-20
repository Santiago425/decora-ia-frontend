import type { RoomData, SceneData, SceneItemData, SceneNodeData, Size3, Vec2 } from '../types/project';
import { flattenItems, itemBounds, type Bounds } from './sceneTree';

/** Catalog shapes that live inside a wall instead of standing on the floor. */
export const WALL_OPENING_SHAPES: ReadonlySet<string> = new Set(['door', 'window']);

export const isWallOpeningShape = (shape: string) => WALL_OPENING_SHAPES.has(shape);

export const isWallOpening = (node: SceneNodeData | undefined): node is SceneItemData =>
  node?.kind === 'item' && isWallOpeningShape(node.shape);

export interface WallMount {
  position: Vec2;
  rotation: number;
}

type Room = Pick<RoomData, 'width' | 'length'>;
type Wall = 'back' | 'front' | 'left' | 'right';

// Back, left, right and front: the order in which a new opening looks for a free spot.
const WALLS: Wall[] = ['back', 'left', 'right', 'front'];
const ROTATION: Record<Wall, number> = { back: 0, front: 180, left: 90, right: -90 };
const SLIDE_STEP = 0.5;

const round = (value: number) => Math.round(value * 1000) / 1000;
const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

function nearestWall([x, z]: Vec2, room: Room): Wall {
  const gaps: [Wall, number][] = [
    ['back', z + room.length / 2],
    ['front', room.length / 2 - z],
    ['left', x + room.width / 2],
    ['right', room.width / 2 - x],
  ];
  return gaps.reduce((best, gap) => (gap[1] < best[1] ? gap : best))[0];
}

function mountOn(wall: Wall, along: number, [width, depth]: Size3, room: Room): WallMount {
  const horizontal = wall === 'back' || wall === 'front';
  const span = horizontal ? room.width : room.length;
  const slide = round(clamp(along, Math.max(0, span / 2 - width / 2)));
  const inset = depth / 2;
  const position: Vec2 = {
    back: [slide, round(-room.length / 2 + inset)],
    front: [slide, round(room.length / 2 - inset)],
    left: [round(-room.width / 2 + inset), slide],
    right: [round(room.width / 2 - inset), slide],
  }[wall] as Vec2;
  return { position, rotation: ROTATION[wall] };
}

/** Puts an opening flat inside the wall closest to a point of the floor, facing into the room. */
export function wallMount(point: Vec2, size: Size3, room: Room): WallMount {
  const wall = nearestWall(point, room);
  const horizontal = wall === 'back' || wall === 'front';
  return mountOn(wall, horizontal ? point[0] : point[1], size, room);
}

const overlaps = (a: Bounds, b: Bounds) => a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;

const probe: SceneItemData = {
  kind: 'item',
  id: '',
  furniture_id: null,
  name: '',
  category: '',
  shape: '',
  position: [0, 0],
  rotation: 0,
  size: [0, 0, 0],
  color: '',
  price: 0,
  finish: null,
  addons: [],
};

const FLAT = 0.05;

function slots(scene: SceneData, size: Size3): WallMount[] {
  const found: WallMount[] = [];
  for (const wall of WALLS) {
    const span = wall === 'back' || wall === 'front' ? scene.room.width : scene.room.length;
    const steps = Math.floor(span / 2 / SLIDE_STEP);
    for (let step = 0; step <= steps; step++) {
      for (const along of step === 0 ? [0] : [step * SLIDE_STEP, -step * SLIDE_STEP]) {
        found.push(mountOn(wall, along, size, scene.room));
      }
    }
  }
  return found;
}

/**
 * First place on a wall that does not cover another door or window. A door also needs the floor in front
 * of it free, so it skips furniture too; a window hangs higher and may sit over a sofa or a desk.
 * Falls back to the middle of the back wall when every wall is taken.
 */
export function findWallSpot(scene: SceneData, size: Size3, shape = 'window'): WallMount {
  const items = flattenItems(scene.nodes);
  const openings = items.filter(isWallOpening).map(itemBounds);
  const furniture = items.filter((item) => !isWallOpeningShape(item.shape) && item.size[2] > FLAT).map(itemBounds);
  const blocked = shape === 'door' ? [...openings, ...furniture] : openings;
  const candidates = slots(scene, size);
  const fits = (obstacles: Bounds[]) => (mount: WallMount) => {
    const bounds = itemBounds({ ...probe, size, ...mount });
    return !obstacles.some((other) => overlaps(bounds, other));
  };
  return candidates.find(fits(blocked)) ?? candidates.find(fits(openings)) ?? mountOn('back', 0, size, scene.room);
}

/** Keeps every door and window inside its wall after the room changes size. */
export function remountOpenings(nodes: SceneNodeData[], room: Room): SceneNodeData[] {
  return nodes.map((node) => {
    if (!isWallOpening(node)) return node;
    return { ...node, ...wallMount(node.position, node.size, room) };
  });
}
