import { config } from '../config';
import type { RoomData, SceneData, SceneGroupData, SceneItemData, SceneNodeData } from '../types/project';
import { decorateFurniture, type PricedFurniture, type Pricing } from './furnitureDecorators';
import { newNodeId, translateNode } from './sceneTree';

// Prototype: a piece (or a whole group) knows how to copy itself into a new, independent piece.
export interface Prototype<T> {
  clone(): T;
}

// Composite: a single item, a group of items and the whole room are priced and counted the same way.
export interface SceneComponent extends Prototype<SceneNodeData> {
  readonly id: string;
  readonly name: string;
  price(): number;
  itemCount(): number;
  leaves(): FurnitureLeaf[];
}

function renewIds(node: SceneNodeData): SceneNodeData {
  if (node.kind === 'group') return { ...node, id: newNodeId('g'), children: node.children.map(renewIds) };
  return { ...node, id: newNodeId() };
}

export class FurnitureLeaf implements SceneComponent {
  constructor(
    readonly data: SceneItemData,
    private readonly pricing: Pricing,
  ) {}

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  furniture(): PricedFurniture {
    return decorateFurniture(this.data, this.pricing);
  }

  price(): number {
    return this.furniture().price();
  }

  itemCount(): number {
    return 1;
  }

  leaves(): FurnitureLeaf[] {
    return [this];
  }

  clone(): SceneItemData {
    const copy = structuredClone(this.data);
    return renewIds(translateNode(copy, config.editor.duplicateOffset, config.editor.duplicateOffset)) as SceneItemData;
  }
}

export class FurnitureGroup implements SceneComponent {
  readonly children: SceneComponent[];

  constructor(
    readonly data: SceneGroupData,
    pricing: Pricing,
  ) {
    this.children = data.children.map((child) => toComponent(child, pricing));
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  price(): number {
    return this.children.reduce((total, child) => total + child.price(), 0);
  }

  itemCount(): number {
    return this.children.reduce((total, child) => total + child.itemCount(), 0);
  }

  leaves(): FurnitureLeaf[] {
    return this.children.flatMap((child) => child.leaves());
  }

  clone(): SceneGroupData {
    const copy = structuredClone(this.data);
    return renewIds(translateNode(copy, config.editor.duplicateOffset, config.editor.duplicateOffset)) as SceneGroupData;
  }
}

export interface SurfaceCost {
  floorArea: number;
  wallArea: number;
  floor: number;
  walls: number;
}

export class RoomComposite {
  readonly children: SceneComponent[];

  constructor(
    readonly scene: SceneData,
    private readonly pricing: Pricing,
  ) {
    this.children = scene.nodes.map((node) => toComponent(node, pricing));
  }

  surfaces(room: RoomData = this.scene.room): SurfaceCost {
    const floorArea = room.width * room.length;
    const wallArea = 2 * (room.width + room.length) * room.height;
    const priceOf = (slug: string | null) => Number(slug ? (this.pricing.materials.get(slug)?.price_per_unit ?? 0) : 0);
    return {
      floorArea,
      wallArea,
      floor: floorArea * priceOf(room.floor_material),
      walls: wallArea * priceOf(room.wall_material),
    };
  }

  furniturePrice(): number {
    return this.children.reduce((total, child) => total + child.price(), 0);
  }

  price(): number {
    const { floor, walls } = this.surfaces();
    return floor + walls + this.furniturePrice();
  }

  itemCount(): number {
    return this.children.reduce((total, child) => total + child.itemCount(), 0);
  }

  find(id: string | null): SceneComponent | undefined {
    return id ? this.children.find((child) => child.id === id) : undefined;
  }
}

export function toComponent(node: SceneNodeData, pricing: Pricing): SceneComponent {
  return node.kind === 'group' ? new FurnitureGroup(node, pricing) : new FurnitureLeaf(node, pricing);
}
