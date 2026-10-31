import type { FurnitureItem, Material } from '../types/catalog';
import type { SceneItemData, Size3, Vec2 } from '../types/project';
import { darken, lighten, mixColors } from '../utils/color';
import { newNodeId } from './sceneTree';

export type PartRole =
  | 'body'
  | 'seat'
  | 'back'
  | 'arm'
  | 'leg'
  | 'top'
  | 'shade'
  | 'pot'
  | 'foliage'
  | 'pillow'
  | 'decor'
  | 'glow';

export interface Part {
  geometry: 'box' | 'cylinder' | 'sphere';
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  role: PartRole;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  emissive?: number;
}

const FINISHABLE: ReadonlySet<PartRole> = new Set(['body', 'seat', 'back', 'arm', 'top']);
const POT_COLOR = '#cdb89b';
const LEG_COLOR_SHIFT = 0.35;

const box = (size: Part['size'], position: Part['position'], color: string, role: PartRole): Part => ({
  geometry: 'box',
  size,
  position,
  color,
  role,
});

const cylinder = (
  radiusTop: number,
  height: number,
  radiusBottom: number,
  position: Part['position'],
  color: string,
  role: PartRole,
): Part => ({ geometry: 'cylinder', size: [radiusTop, height, radiusBottom], position, color, role });

const sphere = (radius: number, position: Part['position'], color: string, role: PartRole): Part => ({
  geometry: 'sphere',
  size: [radius, 0, 0],
  position,
  color,
  role,
});

function legs(width: number, depth: number, height: number, radius: number, color: string, inset = 0.06): Part[] {
  const x = width / 2 - inset;
  const z = depth / 2 - inset;
  return [
    [-x, -z],
    [x, -z],
    [-x, z],
    [x, z],
  ].map(([lx, lz]) => cylinder(radius, height, radius, [lx, height / 2, lz], color, 'leg'));
}

// Factory Method: each subclass decides which 3D parts make up its kind of furniture.
export abstract class FurnitureFactory {
  protected abstract buildParts(width: number, depth: number, height: number, color: string): Part[];

  createModel([width, depth, height]: Size3, color: string, finish?: Pick<Material, 'roughness' | 'metalness'>): Part[] {
    const parts = this.buildParts(width, depth, height, color);
    if (!finish) return parts;
    return parts.map((part) =>
      FINISHABLE.has(part.role) ? { ...part, roughness: finish.roughness, metalness: finish.metalness } : part,
    );
  }

  createItem(item: FurnitureItem, position: Vec2 = [0, 0]): SceneItemData {
    return {
      kind: 'item',
      id: newNodeId(),
      furniture_id: item.id,
      name: item.name,
      category: item.category.slug,
      shape: item.category.shape,
      position,
      rotation: 0,
      size: [item.width, item.depth, item.height],
      color: item.default_color,
      price: Number(item.price),
      finish: null,
      addons: [],
    };
  }
}

export class SofaFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const legHeight = Math.min(0.1, h * 0.12);
    const seatTop = legHeight + h * 0.38;
    const armWidth = Math.min(0.18, w * 0.09);
    const armHeight = seatTop + (h - seatTop) * 0.4 - legHeight;
    const backDepth = d * 0.22;
    return [
      ...legs(w, d, legHeight, 0.025, darken(color, LEG_COLOR_SHIFT)),
      box([w - armWidth * 2, seatTop - legHeight, d - backDepth], [0, legHeight + (seatTop - legHeight) / 2, backDepth / 2], color, 'seat'),
      box([w, h - legHeight, backDepth], [0, legHeight + (h - legHeight) / 2, -d / 2 + backDepth / 2], darken(color, 0.06), 'back'),
      box([armWidth, armHeight, d], [-w / 2 + armWidth / 2, legHeight + armHeight / 2, 0], darken(color, 0.04), 'arm'),
      box([armWidth, armHeight, d], [w / 2 - armWidth / 2, legHeight + armHeight / 2, 0], darken(color, 0.04), 'arm'),
    ];
  }
}

export class ChairFactory extends FurnitureFactory {
  private readonly armchair = new SofaFactory();

  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    if (w >= 0.7) return this.armchair.createModel([w, d, h], color);
    const seatHeight = h * 0.5;
    return [
      ...legs(w, d, seatHeight, 0.02, darken(color, 0.15), 0.04),
      box([w, 0.05, d], [0, seatHeight, 0], color, 'seat'),
      box([w, h - seatHeight, 0.05], [0, seatHeight + (h - seatHeight) / 2, -d / 2 + 0.025], color, 'back'),
    ];
  }
}

export class BedFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const legHeight = 0.08;
    const frameHeight = Math.min(0.3, h * 0.3);
    const mattressHeight = 0.2;
    const frameTop = legHeight + frameHeight;
    const pillowY = frameTop + mattressHeight + 0.05;
    const pillowWidth = w / 2 - 0.12;
    return [
      ...legs(w, d, legHeight, 0.03, darken(color, LEG_COLOR_SHIFT)),
      box([w, frameHeight, d], [0, legHeight + frameHeight / 2, 0], color, 'body'),
      box([w * 0.96, mattressHeight, d * 0.94], [0, frameTop + mattressHeight / 2, 0.02], lighten(color, 0.7), 'seat'),
      box([w, h, 0.08], [0, h / 2, -d / 2 + 0.04], darken(color, 0.08), 'back'),
      box([pillowWidth, 0.1, 0.35], [-w / 4, pillowY, -d / 2 + 0.3], lighten(color, 0.85), 'pillow'),
      box([pillowWidth, 0.1, 0.35], [w / 4, pillowY, -d / 2 + 0.3], lighten(color, 0.85), 'pillow'),
    ];
  }
}

export class TableFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const topThickness = 0.04;
    const legHeight = h - topThickness;
    if (Math.abs(w - d) < 0.05) {
      return [
        cylinder(w / 2, topThickness, w / 2, [0, h - topThickness / 2, 0], color, 'top'),
        cylinder(0.04, legHeight, 0.06, [0, legHeight / 2, 0], darken(color, 0.2), 'leg'),
        cylinder(w * 0.22, 0.02, w * 0.22, [0, 0.01, 0], darken(color, 0.2), 'leg'),
      ];
    }
    return [
      box([w, topThickness, d], [0, h - topThickness / 2, 0], color, 'top'),
      ...legs(w, d, legHeight, 0.03, darken(color, 0.15), 0.08),
    ];
  }
}

export class DeskFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const top = 0.04;
    const panel = 0.04;
    const drawerWidth = Math.min(0.45, w * 0.3);
    return [
      box([w, top, d], [0, h - top / 2, 0], color, 'top'),
      box([panel, h - top, d], [-w / 2 + panel / 2, (h - top) / 2, 0], darken(color, 0.12), 'leg'),
      box([panel, h - top, d], [w / 2 - panel / 2, (h - top) / 2, 0], darken(color, 0.12), 'leg'),
      box([drawerWidth, 0.16, d * 0.9], [w / 2 - panel - drawerWidth / 2, h - top - 0.08, 0], darken(color, 0.06), 'body'),
    ];
  }
}

export class CabinetFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const legHeight = 0.1;
    const bodyHeight = h - legHeight;
    const doors = Math.max(1, Math.round(w / 0.45));
    const doorWidth = w / doors;
    const seams = Array.from({ length: doors - 1 }, (_, i) =>
      box([0.008, bodyHeight * 0.9, 0.01], [-w / 2 + doorWidth * (i + 1), legHeight + bodyHeight / 2, d / 2], darken(color, 0.25), 'decor'),
    );
    return [
      ...legs(w, d, legHeight, 0.02, darken(color, 0.5)),
      box([w, bodyHeight, d], [0, legHeight + bodyHeight / 2, 0], color, 'body'),
      box([w + 0.02, 0.02, d + 0.02], [0, h - 0.01, 0], darken(color, 0.05), 'top'),
      ...seams,
    ];
  }
}

export class ShelfFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const side = 0.03;
    const levels = Math.max(2, Math.round(h / 0.4));
    const gap = (h - 0.03) / levels;
    const shelves = Array.from({ length: levels + 1 }, (_, i) =>
      box([w - side * 2, 0.025, d], [0, 0.0125 + i * gap, 0], color, 'top'),
    );
    const books = Array.from({ length: levels }, (_, i) => {
      const bookColor = i % 2 ? '#7d8f69' : '#c4704f';
      return box([w * 0.35, gap * 0.55, d * 0.7], [((i % 3) - 1) * w * 0.2, 0.025 + i * gap + gap * 0.28, 0], bookColor, 'decor');
    });
    return [
      box([side, h, d], [-w / 2 + side / 2, h / 2, 0], darken(color, 0.08), 'body'),
      box([side, h, d], [w / 2 - side / 2, h / 2, 0], darken(color, 0.08), 'body'),
      box([w, h, 0.01], [0, h / 2, -d / 2 + 0.005], darken(color, 0.15), 'body'),
      ...shelves,
      ...books,
    ];
  }
}

export class LampFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const radius = Math.min(w, d) / 2;
    const shadeHeight = Math.max(0.12, h * 0.22);
    return [
      cylinder(radius * 0.7, 0.03, radius * 0.7, [0, 0.015, 0], darken(color, 0.2), 'leg'),
      cylinder(0.015, h - shadeHeight, 0.015, [0, (h - shadeHeight) / 2, 0], color, 'leg'),
      { ...cylinder(radius * 0.55, shadeHeight, radius, [0, h - shadeHeight / 2, 0], lighten(color, 0.75), 'shade'), emissive: 0.25 },
    ];
  }
}

export class RugFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    return [
      box([w, h, d], [0, h / 2, 0], color, 'body'),
      box([w * 0.8, h, d * 0.8], [0, h / 2 + 0.002, 0], lighten(color, 0.25), 'decor'),
    ];
  }
}

export class PlantFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const radius = Math.min(w, d) / 2;
    const potHeight = h * 0.28;
    return [
      cylinder(radius * 0.6, potHeight, radius * 0.45, [0, potHeight / 2, 0], POT_COLOR, 'pot'),
      cylinder(0.02, h * 0.4, 0.02, [0, potHeight + h * 0.2, 0], darken(color, 0.4), 'foliage'),
      sphere(radius * 0.9, [0, h - radius * 0.9, 0], color, 'foliage'),
      sphere(radius * 0.6, [radius * 0.45, h - radius * 1.5, radius * 0.2], mixColors(color, '#ffffff', 0.12), 'foliage'),
      sphere(radius * 0.55, [-radius * 0.4, h - radius * 1.45, -radius * 0.25], darken(color, 0.1), 'foliage'),
    ];
  }
}

export class BoxFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    return [box([w, h, d], [0, h / 2, 0], color, 'body')];
  }
}

const FACTORIES: Record<string, FurnitureFactory> = {
  sofa: new SofaFactory(),
  chair: new ChairFactory(),
  bed: new BedFactory(),
  table: new TableFactory(),
  desk: new DeskFactory(),
  cabinet: new CabinetFactory(),
  shelf: new ShelfFactory(),
  lamp: new LampFactory(),
  rug: new RugFactory(),
  plant: new PlantFactory(),
};

const fallback = new BoxFactory();

export function furnitureFactoryFor(shape: string): FurnitureFactory {
  return FACTORIES[shape] ?? fallback;
}
