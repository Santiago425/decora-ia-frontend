import type { SceneData, SceneGroupData, SceneItemData, SceneNodeData, Vec2 } from '../types/project';

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const newNodeId = (prefix = 'n') => `${prefix}-${Math.random().toString(36).slice(2, 12)}`;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function normalizeAngle(degrees: number): number {
  const angle = ((degrees % 360) + 360) % 360;
  return angle > 180 ? angle - 360 : angle;
}

export function findNode(nodes: SceneNodeData[], id: string): SceneNodeData | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.kind === 'group') {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function topLevelIdOf(nodes: SceneNodeData[], id: string): string | undefined {
  return nodes.find((node) => node.id === id || (node.kind === 'group' && findNode(node.children, id)))?.id;
}

export function flattenItems(nodes: SceneNodeData[]): SceneItemData[] {
  return nodes.flatMap((node) => (node.kind === 'group' ? flattenItems(node.children) : [node]));
}

export function replaceNode(
  nodes: SceneNodeData[],
  id: string,
  update: (node: SceneNodeData) => SceneNodeData,
): SceneNodeData[] {
  return nodes.map((node) => {
    if (node.id === id) return update(node);
    if (node.kind === 'group') return { ...node, children: replaceNode(node.children, id, update) };
    return node;
  });
}

export interface RemovedNode {
  nodes: SceneNodeData[];
  node?: SceneNodeData;
  parentId: string | null;
  index: number;
}

export function removeNode(nodes: SceneNodeData[], id: string, parentId: string | null = null): RemovedNode {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) return { nodes: nodes.filter((_, i) => i !== index), node: nodes[index], parentId, index };
  for (const [i, node] of nodes.entries()) {
    if (node.kind !== 'group') continue;
    const result = removeNode(node.children, id, node.id);
    if (result.node) {
      const copy = [...nodes];
      copy[i] = { ...node, children: result.nodes };
      return { ...result, nodes: copy };
    }
  }
  return { nodes, parentId: null, index: -1 };
}

export function insertNode(
  nodes: SceneNodeData[],
  node: SceneNodeData,
  parentId: string | null,
  index: number,
): SceneNodeData[] {
  if (parentId === null) {
    const copy = [...nodes];
    copy.splice(index < 0 ? copy.length : index, 0, node);
    return copy;
  }
  return replaceNode(nodes, parentId, (parent) =>
    parent.kind === 'group' ? { ...parent, children: insertNode(parent.children, node, null, index) } : parent,
  );
}

export function translateNode(node: SceneNodeData, dx: number, dz: number): SceneNodeData {
  if (node.kind === 'group') return { ...node, children: node.children.map((child) => translateNode(child, dx, dz)) };
  return { ...node, position: [round(node.position[0] + dx), round(node.position[1] + dz)] };
}

function rotateAround(node: SceneNodeData, degrees: number, [cx, cz]: Vec2): SceneNodeData {
  if (node.kind === 'group') {
    return { ...node, children: node.children.map((child) => rotateAround(child, degrees, [cx, cz])) };
  }
  const angle = toRadians(degrees);
  const [ox, oz] = [node.position[0] - cx, node.position[1] - cz];
  const position: Vec2 = [
    round(cx + ox * Math.cos(angle) + oz * Math.sin(angle)),
    round(cz - ox * Math.sin(angle) + oz * Math.cos(angle)),
  ];
  return { ...node, position, rotation: normalizeAngle(node.rotation + degrees) };
}

export function rotateNode(node: SceneNodeData, degrees: number): SceneNodeData {
  return rotateAround(node, degrees, nodeCenter(node));
}

export function itemBounds(item: SceneItemData): Bounds {
  const [width, depth] = item.size;
  const angle = toRadians(item.rotation);
  const halfX = Math.abs((width / 2) * Math.cos(angle)) + Math.abs((depth / 2) * Math.sin(angle));
  const halfZ = Math.abs((width / 2) * Math.sin(angle)) + Math.abs((depth / 2) * Math.cos(angle));
  const [x, z] = item.position;
  return { minX: x - halfX, maxX: x + halfX, minZ: z - halfZ, maxZ: z + halfZ };
}

export function nodeBounds(node: SceneNodeData): Bounds {
  const items = node.kind === 'group' ? flattenItems(node.children) : [node];
  if (!items.length) return { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  return items.map(itemBounds).reduce((a, b) => ({
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minZ: Math.min(a.minZ, b.minZ),
    maxZ: Math.max(a.maxZ, b.maxZ),
  }));
}

export function nodeCenter(node: SceneNodeData): Vec2 {
  const bounds = nodeBounds(node);
  return [(bounds.minX + bounds.maxX) / 2, (bounds.minZ + bounds.maxZ) / 2];
}

export function isGroup(node: SceneNodeData | undefined): node is SceneGroupData {
  return node?.kind === 'group';
}

const overlaps = (a: Bounds, b: Bounds) => a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;

export function findFreeSpot(scene: SceneData, [width, depth]: [number, number], step = 0.25): Vec2 {
  const occupied = flattenItems(scene.nodes)
    .filter((item) => item.size[2] > 0.05)
    .map(itemBounds);
  const halfW = scene.room.width / 2 - width / 2;
  const halfL = scene.room.length / 2 - depth / 2;
  const rings = Math.ceil(Math.max(scene.room.width, scene.room.length) / step);
  for (let ring = 0; ring <= rings; ring++) {
    for (let i = -ring; i <= ring; i++) {
      for (const [x, z] of [[i, -ring], [i, ring], [-ring, i], [ring, i]]) {
        const spot: Vec2 = [round(x * step), round(z * step)];
        if (Math.abs(spot[0]) > halfW || Math.abs(spot[1]) > halfL) continue;
        const bounds = { minX: spot[0] - width / 2, maxX: spot[0] + width / 2, minZ: spot[1] - depth / 2, maxZ: spot[1] + depth / 2 };
        if (!occupied.some((other) => overlaps(bounds, other))) return spot;
      }
    }
  }
  return [0, 0];
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
