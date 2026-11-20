import type { AddonVisual, FurnitureAddon, Material } from '../types/catalog';
import type { SceneItemData } from '../types/project';
import { cssVar } from '../styles/theme';
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
    if (shade)
      return parts.map((part) => (part === shade ? { ...part, color: lighten(this.color, 0.3), emissive: 0.9 } : part));
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

interface Surface {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
}

const SURFACE_ROLES: ReadonlySet<Part['role']> = new Set(['top', 'body', 'seat']);

/** Highest flat part a small object can stand on, such as a table top or the lid of a cabinet. */
function surfaceOf(parts: Part[]): Surface | null {
  let best: Surface | null = null;
  for (const part of parts) {
    if (!SURFACE_ROLES.has(part.role) || part.geometry === 'sphere') continue;
    const wide = part.geometry === 'box' ? part.size[0] : Math.max(part.size[0], part.size[2]) * 2;
    const deep = part.geometry === 'box' ? part.size[2] : wide;
    const top = part.position[1] + part.size[1] / 2;
    if (wide < 0.15 || deep < 0.12) continue;
    if (!best || top > best.y) best = { x: part.position[0], y: top, z: part.position[2], width: wide, depth: deep };
  }
  return best;
}

/** Decorator that places one small object on the furniture's top surface. */
abstract class SurfaceDecorator extends AddonDecorator {
  protected abstract objects(surface: Surface): Part[];

  parts(): Part[] {
    const parts = this.inner.parts();
    const surface = surfaceOf(parts);
    return surface ? [...parts, ...this.objects(surface)] : parts;
  }
}

export class BooksDecorator extends SurfaceDecorator {
  protected objects({ x, y, z, width, depth }: Surface): Part[] {
    const size = Math.min(0.24, width * 0.35);
    const cx = x + width / 2 - size * 0.8;
    return [0, 1, 2].map((i) => ({
      geometry: 'box',
      size: [size * (1 - i * 0.12), 0.035, Math.min(0.18, depth * 0.6) * (1 - i * 0.1)],
      position: [cx, y + 0.0175 + i * 0.035, z],
      color: i === 1 ? lighten(this.color, 0.45) : i === 2 ? darken(this.color, 0.2) : this.color,
      role: 'decor',
      roughness: 0.9,
    }));
  }
}

export class VaseDecorator extends SurfaceDecorator {
  protected objects({ x, y, z }: Surface): Part[] {
    const bloom = cssVar('--scene-plant') || darken(this.color, 0.4);
    return [
      {
        geometry: 'cylinder',
        size: [0.045, 0.2, 0.06],
        position: [x, y + 0.1, z],
        color: this.color,
        role: 'decor',
        roughness: 0.3,
      },
      { geometry: 'sphere', size: [0.09, 0, 0], position: [x, y + 0.27, z], color: bloom, role: 'decor', roughness: 1 },
      {
        geometry: 'sphere',
        size: [0.045, 0, 0],
        position: [x + 0.06, y + 0.3, z + 0.03],
        color: cssVar('--chart-2') || lighten(this.color, 0.2),
        role: 'decor',
        roughness: 1,
      },
    ];
  }
}

export class RunnerDecorator extends SurfaceDecorator {
  protected objects({ x, y, z, width, depth }: Surface): Part[] {
    return [
      {
        geometry: 'box',
        size: [width * 0.92, 0.006, Math.min(0.4, depth * 0.35)],
        position: [x, y + 0.003, z],
        color: this.color,
        role: 'decor',
        roughness: 1,
      },
    ];
  }
}

export class TableLampDecorator extends SurfaceDecorator {
  protected objects({ x, y, z, width }: Surface): Part[] {
    const cx = x - width / 2 + Math.min(0.14, width * 0.3);
    return [
      {
        geometry: 'cylinder',
        size: [0.05, 0.03, 0.06],
        position: [cx, y + 0.015, z],
        color: darken(this.color, 0.5),
        role: 'decor',
      },
      {
        geometry: 'cylinder',
        size: [0.012, 0.22, 0.012],
        position: [cx, y + 0.14, z],
        color: darken(this.color, 0.5),
        role: 'decor',
      },
      {
        geometry: 'cylinder',
        size: [0.07, 0.14, 0.11],
        position: [cx, y + 0.29, z],
        color: this.color,
        role: 'shade',
        emissive: 0.6,
      },
    ];
  }
}

export class SucculentDecorator extends SurfaceDecorator {
  protected objects({ x, y, z, width }: Surface): Part[] {
    const cx = x + width / 2 - 0.1;
    return [
      {
        geometry: 'cylinder',
        size: [0.05, 0.08, 0.04],
        position: [cx, y + 0.04, z],
        color: cssVar('--scene-pot') || lighten(this.color, 0.6),
        role: 'pot',
        roughness: 0.4,
      },
      {
        geometry: 'sphere',
        size: [0.055, 0, 0],
        position: [cx, y + 0.11, z],
        color: this.color,
        role: 'foliage',
        roughness: 1,
      },
    ];
  }
}

export class TowelsDecorator extends SurfaceDecorator {
  protected objects({ x, y, z, width, depth }: Surface): Part[] {
    const size: [number, number, number] = [Math.min(0.3, width * 0.4), 0.05, Math.min(0.22, depth * 0.7)];
    return [0, 1].map((i) => ({
      geometry: 'box',
      size,
      position: [x - width / 4, y + 0.025 + i * 0.05, z],
      color: i ? lighten(this.color, 0.1) : this.color,
      role: 'decor',
      roughness: 1,
    }));
  }
}

export class HeadboardDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const back = parts.find((part) => part.role === 'back');
    if (!back) return parts;
    const [width, height] = back.size;
    const tall = Math.max(height, 1.15);
    const panel: Part = {
      geometry: 'box',
      size: [width * 1.04, tall * 0.62, 0.1],
      position: [back.position[0], tall * 0.62, back.position[2] + 0.06],
      color: this.color,
      role: 'decor',
      roughness: 1,
    };
    return [...parts, panel];
  }
}

export class DuvetDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const mattress = parts.find((part) => part.role === 'seat');
    if (!mattress) return parts;
    const [width, height, depth] = mattress.size;
    const cover: Part = {
      geometry: 'box',
      size: [width * 1.03, 0.05, depth * 0.66],
      position: [mattress.position[0], mattress.position[1] + height / 2 + 0.02, mattress.position[2] + depth * 0.17],
      color: this.color,
      role: 'decor',
      roughness: 1,
    };
    return [...parts, cover];
  }
}

export class FrameDecorator extends AddonDecorator {
  parts(): Part[] {
    return this.inner
      .parts()
      .map((part) => (part.role === 'body' ? { ...part, color: this.color, metalness: 0.85, roughness: 0.3 } : part));
  }
}

export class SheerDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const [width, depth, height] = this.item.size;
    const veil: Part = {
      geometry: 'box',
      size: [width, height - 0.06, 0.01],
      position: [0, (height - 0.06) / 2, depth / 2 + 0.01],
      color: this.color,
      role: 'decor',
      roughness: 1,
      opacity: 0.4,
    };
    return [...parts, veil];
  }
}

export class SoundbarDecorator extends AddonDecorator {
  parts(): Part[] {
    const parts = this.inner.parts();
    const screen = parts.find((part) => part.role === 'glass');
    const [width, depth] = this.item.size;
    const surface = screen ? null : surfaceOf(parts);
    const y = screen ? screen.position[1] - screen.size[1] / 2 - 0.06 : (surface?.y ?? 0) + 0.04;
    const bar: Part = {
      geometry: 'box',
      size: [Math.min(1, width * 0.7), 0.07, 0.09],
      position: [0, y, screen ? depth / 2 : (surface?.z ?? 0) + depth * 0.25],
      color: this.color,
      role: 'decor',
      roughness: 0.6,
    };
    return [...parts, bar];
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
  books: BooksDecorator,
  vase: VaseDecorator,
  runner: RunnerDecorator,
  lamp: TableLampDecorator,
  succulent: SucculentDecorator,
  towels: TowelsDecorator,
  headboard: HeadboardDecorator,
  duvet: DuvetDecorator,
  frame: FrameDecorator,
  sheer: SheerDecorator,
  soundbar: SoundbarDecorator,
  none: ServiceDecorator,
};

export interface Pricing {
  addons: Map<string, FurnitureAddon>;
  materials: Map<string, Material>;
}

export function decorateFurniture(item: SceneItemData, pricing: Pricing): PricedFurniture {
  const finish = item.finish ? pricing.materials.get(item.finish) : undefined;
  return item.addons.reduce<PricedFurniture>(
    (furniture, slug) => {
      const addon = pricing.addons.get(slug);
      if (!addon) return furniture;
      const Decorator = DECORATORS[addon.visual] ?? ServiceDecorator;
      return new Decorator(furniture, addon, item);
    },
    new BaseFurniture(item, finish),
  );
}

export function buildPricing(addons: FurnitureAddon[], materials: Material[]): Pricing {
  return {
    addons: new Map(addons.map((addon) => [addon.slug, addon])),
    materials: new Map(materials.map((material) => [material.slug, material])),
  };
}
