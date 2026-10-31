import type { AddonVisual, FurnitureAddon, Material } from '../types/catalog';
import type { SceneItemData } from '../types/project';
import { darken, lighten } from '../utils/color';
import { furnitureFactoryFor, type Part } from './furnitureFactory';

export interface PricedFurniture {
  price(): number;
  labels(): string[];
  parts(): Part[];
}

export class BaseFurniture implements PricedFurniture {
  constructor(
    private readonly item: SceneItemData,
    private readonly finish?: Material,
  ) {}

  price(): number {
    return this.item.price;
  }

  labels(): string[] {
    return [this.item.name];
  }

  parts(): Part[] {
    return furnitureFactoryFor(this.item.shape).createModel(this.item.size, this.item.color, this.finish);
  }
}

// Decorator: each add-on wraps the furniture, adding its price and, when it has one, its look.
export abstract class AddonDecorator implements PricedFurniture {
  constructor(
    protected readonly inner: PricedFurniture,
    protected readonly addon: FurnitureAddon,
    protected readonly item: SceneItemData,
  ) {}

  protected get color(): string {
    return this.addon.color_hex ?? this.item.color;
  }

  price(): number {
    return this.inner.price() + Number(this.addon.price);
  }

  labels(): string[] {
    return [...this.inner.labels(), this.addon.name];
  }

  parts(): Part[] {
    return this.inner.parts();
  }
}

export class ServiceDecorator extends AddonDecorator {}

export class CushionsDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const seat = parts.find((part) => part.role === 'seat');
    if (!seat) return parts;
    const [width, height, depth] = seat.size;
    const count = width > 1.2 ? 3 : width > 0.6 ? 2 : 1;
    const size = Math.min(0.42, (width / count) * 0.8);
    const top = seat.position[1] + height / 2 + size / 2 - 0.04;
    const z = seat.position[2] - depth / 2 + 0.12;
    const cushions = Array.from({ length: count }, (_, i): Part => ({
      geometry: 'box',
      size: [size, size, 0.12],
      position: [seat.position[0] - width / 2 + (width / count) * (i + 0.5), top, z],
      color: i % 2 ? darken(this.color, 0.12) : this.color,
      role: 'pillow',
      roughness: 1,
    }));
    return [...parts, ...cushions];
  }
}

export class ThrowDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const seat = parts.find((part) => part.role === 'seat');
    if (!seat) return parts;
    const [width, height, depth] = seat.size;
    const blanket: Part = {
      geometry: 'box',
      size: [width * 0.3, 0.025, depth * 0.95],
      position: [seat.position[0] + width * 0.25, seat.position[1] + height / 2 + 0.015, seat.position[2]],
      color: this.color,
      role: 'decor',
      roughness: 1,
    };
    return [...parts, blanket];
  }
}

export class GlassTopDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const top = parts.find((part) => part.role === 'top');
    if (!top) return parts;
    const glass: Part = {
      ...top,
      size: [top.size[0], top.geometry === 'box' ? 0.012 : 0.012, top.size[2]],
      position: [top.position[0], top.position[1] + top.size[1] / 2 + 0.008, top.position[2]],
      color: this.color,
      role: 'decor',
      roughness: 0.05,
      metalness: 0.1,
      opacity: 0.45,
    };
    return [...parts, glass];
  }
}

export class LegsDecorator extends AddonDecorator {
  parts(): Part[] {
    return this.inner
      .parts()
      .map((part) => (part.role === 'leg' ? { ...part, color: this.color, metalness: 0.85, roughness: 0.3 } : part));
  }
}

export class GlowDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const shade = parts.find((part) => part.role === 'shade');
    if (shade) return parts.map((part) => (part === shade ? { ...part, color: lighten(this.color, 0.3), emissive: 0.9 } : part));
    const [width, depth, height] = this.item.size;
    const strip: Part = {
      geometry: 'box',
      size: [width * 0.9, 0.012, 0.012],
      position: [0, height * 0.92, depth / 2 - 0.01],
      color: this.color,
      role: 'glow',
      emissive: 1,
    };
    return [...parts, strip];
  }
}

export class PotDecorator extends AddonDecorator {
  parts(): Part[] {
    return this.inner
      .parts()
      .map((part) => (part.role === 'pot' ? { ...part, color: this.color, roughness: 0.25, metalness: 0.05 } : part));
  }
}

type DecoratorClass = new (inner: PricedFurniture, addon: FurnitureAddon, item: SceneItemData) => AddonDecorator;

const DECORATORS: Record<AddonVisual, DecoratorClass> = {
  cushions: CushionsDecorator,
  throw: ThrowDecorator,
  glass: GlassTopDecorator,
  legs: LegsDecorator,
  glow: GlowDecorator,
  pot: PotDecorator,
  none: ServiceDecorator,
};

export interface Pricing {
  addons: Map<string, FurnitureAddon>;
  materials: Map<string, Material>;
}

export function decorateFurniture(item: SceneItemData, pricing: Pricing): PricedFurniture {
  const finish = item.finish ? pricing.materials.get(item.finish) : undefined;
  return item.addons.reduce<PricedFurniture>((furniture, slug) => {
    const addon = pricing.addons.get(slug);
    if (!addon) return furniture;
    const Decorator = DECORATORS[addon.visual] ?? ServiceDecorator;
    return new Decorator(furniture, addon, item);
  }, new BaseFurniture(item, finish));
}

export function buildPricing(addons: FurnitureAddon[], materials: Material[]): Pricing {
  return {
    addons: new Map(addons.map((addon) => [addon.slug, addon])),
    materials: new Map(materials.map((material) => [material.slug, material])),
  };
}
