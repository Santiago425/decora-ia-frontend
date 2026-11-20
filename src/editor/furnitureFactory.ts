import type { FurnitureItem, Material } from '../types/catalog';
import type { SceneItemData, Size3, Vec2 } from '../types/project';
import { config } from '../config';
import { cssVar } from '../styles/theme';
import { darken, lighten } from '../utils/color';
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
  | 'glow'
  | 'glass';

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

  createModel(
    [width, depth, height]: Size3,
    color: string,
    finish?: Pick<Material, 'roughness' | 'metalness'>,
  ): Part[] {
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
      box(
        [w - armWidth * 2, seatTop - legHeight, d - backDepth],
        [0, legHeight + (seatTop - legHeight) / 2, backDepth / 2],
        color,
        'seat',
      ),
      box(
        [w, h - legHeight, backDepth],
        [0, legHeight + (h - legHeight) / 2, -d / 2 + backDepth / 2],
        darken(color, 0.06),
        'back',
      ),
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
      box(
        [drawerWidth, 0.16, d * 0.9],
        [w / 2 - panel - drawerWidth / 2, h - top - 0.08, 0],
        darken(color, 0.06),
        'body',
      ),
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
      box(
        [0.008, bodyHeight * 0.9, 0.01],
        [-w / 2 + doorWidth * (i + 1), legHeight + bodyHeight / 2, d / 2],
        darken(color, 0.25),
        'decor',
      ),
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
      const bookColor = (i % 2 ? cssVar('--chart-1') : cssVar('--chart-2')) || darken(color, 0.3 + (i % 2) * 0.2);
      return box(
        [w * 0.35, gap * 0.55, d * 0.7],
        [((i % 3) - 1) * w * 0.2, 0.025 + i * gap + gap * 0.28, 0],
        bookColor,
        'decor',
      );
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
      {
        ...cylinder(radius * 0.55, shadeHeight, radius, [0, h - shadeHeight / 2, 0], lighten(color, 0.75), 'shade'),
        emissive: 0.25,
      },
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
      cylinder(
        radius * 0.6,
        potHeight,
        radius * 0.45,
        [0, potHeight / 2, 0],
        cssVar('--scene-pot') || lighten(color, 0.6),
        'pot',
      ),
      cylinder(0.02, h * 0.4, 0.02, [0, potHeight + h * 0.2, 0], darken(color, 0.4), 'foliage'),
      sphere(radius * 0.9, [0, h - radius * 0.9, 0], color, 'foliage'),
      sphere(radius * 0.6, [radius * 0.45, h - radius * 1.5, radius * 0.2], lighten(color, 0.12), 'foliage'),
      sphere(radius * 0.55, [-radius * 0.4, h - radius * 1.45, -radius * 0.25], darken(color, 0.1), 'foliage'),
    ];
  }
}

const metal = (part: Part): Part => ({ ...part, roughness: 0.25, metalness: 0.85 });
const glass = (part: Part, opacity = 0.3): Part => ({ ...part, roughness: 0.05, opacity });

export class ToiletFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const seatHeight = Math.min(0.42, h * 0.55);
    const radius = Math.min(w / 2, d * 0.35);
    const bowlZ = d / 2 - radius;
    const tankDepth = Math.min(0.2, d * 0.3);
    const tankBottom = seatHeight * 0.8;
    const tankHeight = h - tankBottom;
    return [
      cylinder(radius * 0.95, seatHeight * 0.8, radius * 0.6, [0, seatHeight * 0.4, bowlZ], color, 'body'),
      box(
        [radius * 1.2, seatHeight * 0.8, bowlZ + d / 2 - tankDepth],
        [0, seatHeight * 0.4, (bowlZ - d / 2 + tankDepth) / 2],
        color,
        'body',
      ),
      cylinder(radius, 0.04, radius, [0, seatHeight - 0.02, bowlZ], lighten(color, 0.3), 'seat'),
      box([w, tankHeight, tankDepth], [0, tankBottom + tankHeight / 2, -d / 2 + tankDepth / 2], color, 'back'),
      box([w + 0.01, 0.03, tankDepth + 0.01], [0, h - 0.015, -d / 2 + tankDepth / 2], darken(color, 0.04), 'top'),
    ];
  }
}

export class VanityFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const counter = 0.03;
    const bodyHeight = h * 0.82;
    const top = bodyHeight + counter;
    const basins = w >= 1.1 ? 2 : 1;
    const radius = Math.min(0.2, d * 0.36, w / (basins * 2) - 0.05);
    const porcelain = lighten(color, 0.92);
    const sinks = Array.from({ length: basins }, (_, i) => {
      const x = basins === 1 ? 0 : (i === 0 ? -1 : 1) * (w / 4);
      return [
        cylinder(radius, 0.12, radius * 0.8, [x, top + 0.06, 0.03], porcelain, 'decor'),
        metal(cylinder(0.015, 0.16, 0.015, [x, top + 0.08, -d / 2 + 0.06], darken(color, 0.6), 'decor')),
      ];
    }).flat();
    return [
      box([w, bodyHeight, d], [0, bodyHeight / 2, 0], color, 'body'),
      box([w * 0.96, 0.008, 0.01], [0, bodyHeight * 0.5, d / 2], darken(color, 0.25), 'decor'),
      box([w + 0.02, counter, d + 0.02], [0, bodyHeight + counter / 2, 0], lighten(color, 0.85), 'top'),
      ...sinks,
    ];
  }
}

export class BathtubFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const rim = 0.07;
    return [
      box([w, h - 0.02, d], [0, (h - 0.02) / 2, 0], color, 'body'),
      box([w, 0.02, rim], [0, h - 0.01, -d / 2 + rim / 2], lighten(color, 0.2), 'top'),
      box([w, 0.02, rim], [0, h - 0.01, d / 2 - rim / 2], lighten(color, 0.2), 'top'),
      box([rim, 0.02, d - rim * 2], [-w / 2 + rim / 2, h - 0.01, 0], lighten(color, 0.2), 'top'),
      box([rim, 0.02, d - rim * 2], [w / 2 - rim / 2, h - 0.01, 0], lighten(color, 0.2), 'top'),
      box([w - rim * 2, 0.01, d - rim * 2], [0, h - 0.03, 0], darken(color, 0.08), 'decor'),
      metal(cylinder(0.02, 0.2, 0.02, [-w / 2 + rim / 2, h + 0.1, 0], darken(color, 0.6), 'decor')),
    ];
  }
}

export class ShowerFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const tray = 0.06;
    const panel = h - tray;
    const pipe = darken(color, 0.6);
    return [
      box([w, tray, d], [0, tray / 2, 0], lighten(color, 0.8), 'body'),
      box([0.08, 0.005, 0.08], [0, tray + 0.003, 0], darken(color, 0.4), 'decor'),
      glass(box([w, panel, 0.01], [0, tray + panel / 2, d / 2 - 0.005], color, 'decor')),
      glass(box([0.01, panel, d], [w / 2 - 0.005, tray + panel / 2, 0], color, 'decor')),
      metal(cylinder(0.015, h * 0.9 - tray, 0.015, [0, tray + (h * 0.9 - tray) / 2, -d / 2 + 0.03], pipe, 'decor')),
      metal(cylinder(0.11, 0.02, 0.11, [0, h * 0.9, -d / 2 + 0.14], pipe, 'decor')),
    ];
  }
}

const MIRROR_BOTTOM = 0.95;

export class MirrorFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const bottom = h >= 1.4 ? 0.05 : MIRROR_BOTTOM;
    const frame = Math.min(0.04, w * 0.06);
    return [
      box([w, h, d * 0.6], [0, bottom + h / 2, -d * 0.2], color, 'body'),
      {
        ...box(
          [w - frame * 2, h - frame * 2, 0.006],
          [0, bottom + h / 2, d / 2 - 0.003],
          cssVar('--scene-mirror') || lighten(color, 0.9),
          'decor',
        ),
        roughness: 0.08,
        metalness: 0.25,
      },
    ];
  }
}

export class FridgeFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const plinth = 0.04;
    const seam = h * 0.64;
    const handle = darken(color, 0.45);
    const split = w >= 0.85;
    return [
      box([w * 0.96, plinth, d * 0.9], [0, plinth / 2, -d * 0.03], darken(color, 0.5), 'leg'),
      { ...box([w, h - plinth, d], [0, plinth + (h - plinth) / 2, 0], color, 'body'), roughness: 0.35 },
      box([w, 0.008, 0.01], [0, seam, d / 2], darken(color, 0.25), 'decor'),
      ...(split ? [box([0.008, h - seam, 0.01], [0, seam + (h - seam) / 2, d / 2], darken(color, 0.25), 'decor')] : []),
      metal(box([0.02, h * 0.22, 0.02], [split ? -0.05 : w / 2 - 0.06, seam + h * 0.14, d / 2], handle, 'decor')),
      ...(split ? [metal(box([0.02, h * 0.22, 0.02], [0.05, seam + h * 0.14, d / 2], handle, 'decor'))] : []),
      metal(box([w * 0.5, 0.02, 0.02], [0, seam - 0.06, d / 2], handle, 'decor')),
    ];
  }
}

export class StoveFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const cooktop = 0.02;
    const body = h - cooktop;
    const burner = Math.min(w, d) * 0.12;
    const burners = [
      [-w / 4, -d / 5],
      [w / 4, -d / 5],
      [-w / 4, d / 5],
      [w / 4, d / 5],
    ].map(([x, z]) => cylinder(burner, 0.012, burner, [x, h + 0.006, z], darken(color, 0.6), 'decor'));
    return [
      box([w, body, d], [0, body / 2, 0], color, 'body'),
      box([w, cooktop, d], [0, body + cooktop / 2, 0], darken(color, 0.35), 'top'),
      ...burners,
      glass(box([w * 0.84, body * 0.5, 0.01], [0, body * 0.38, d / 2 - 0.005], darken(color, 0.7), 'decor'), 0.85),
      metal(box([w * 0.7, 0.02, 0.025], [0, body * 0.7, d / 2 - 0.0125], lighten(color, 0.5), 'decor')),
    ];
  }
}

export class CounterFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const kick = 0.1;
    const top = 0.04;
    const body = h - kick - top;
    const doors = Math.max(1, Math.round(w / 0.5));
    const doorWidth = w / doors;
    const seams = Array.from({ length: doors - 1 }, (_, i) =>
      box(
        [0.008, body * 0.9, 0.01],
        [-w / 2 + doorWidth * (i + 1), kick + body / 2, d / 2 - 0.02],
        darken(color, 0.25),
        'decor',
      ),
    );
    const againstWall = d < 0.75;
    const sinkWidth = Math.min(0.6, w * 0.35);
    const sink = againstWall
      ? [
          box([sinkWidth, 0.006, d * 0.55], [w / 4, h + 0.003, 0], darken(color, 0.45), 'decor'),
          metal(cylinder(0.015, 0.25, 0.015, [w / 4, h + 0.125, -d / 2 + 0.06], darken(color, 0.6), 'decor')),
        ]
      : [];
    return [
      box([w - 0.04, kick, d - 0.08], [0, kick / 2, -0.02], darken(color, 0.4), 'leg'),
      box([w, body, d - 0.04], [0, kick + body / 2, -0.02], color, 'body'),
      ...seams,
      box([w, top, d], [0, h - top / 2, 0], lighten(color, 0.55), 'top'),
      ...sink,
    ];
  }
}

export class WardrobeFactory extends CabinetFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const doors = Math.max(1, Math.round(w / 0.6));
    const doorWidth = w / doors;
    const handles = Array.from({ length: doors }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const x = -w / 2 + doorWidth * i + doorWidth / 2 + side * (doorWidth / 2 - 0.06);
      return metal(box([0.015, 0.3, 0.02], [x, h * 0.55, d / 2], darken(color, 0.45), 'decor'));
    });
    return [...super.buildParts(w, d, h, color), ...handles];
  }
}

const SCREEN_RATIO = 0.58;

export class TvStandFactory extends CabinetFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const screenWidth = w * 0.68;
    const screenHeight = screenWidth * SCREEN_RATIO;
    const screen = darken(color, 0.85);
    const screenY = h + 0.08 + screenHeight / 2;
    return [
      ...super.buildParts(w, d, h, color),
      box([0.25, 0.015, 0.18], [0, h + 0.0075, -d / 2 + 0.12], screen, 'decor'),
      box([0.05, 0.08, 0.03], [0, h + 0.04, -d / 2 + 0.1], screen, 'decor'),
      {
        ...box([screenWidth, screenHeight, 0.04], [0, screenY, -d / 2 + 0.08], screen, 'decor'),
        roughness: 0.2,
        metalness: 0.3,
      },
    ];
  }
}

export class BoxFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    return [box([w, h, d], [0, h / 2, 0], color, 'body')];
  }
}

const FRAME = 0.06;

export class DoorFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const frame = darken(color, 0.18);
    const leafHeight = h - FRAME;
    const leafs = w > 1.2 ? 2 : 1;
    const leafWidth = (w - FRAME * 2) / leafs;
    const handleHeight = Math.min(1, h * 0.48);
    const handle = cssVar('--scene-handle');
    const parts: Part[] = [
      box([FRAME, h, d], [-(w - FRAME) / 2, h / 2, 0], frame, 'body'),
      box([FRAME, h, d], [(w - FRAME) / 2, h / 2, 0], frame, 'body'),
      box([w, FRAME, d], [0, h - FRAME / 2, 0], frame, 'body'),
    ];
    for (let leaf = 0; leaf < leafs; leaf++) {
      const x = -w / 2 + FRAME + leafWidth * (leaf + 0.5);
      parts.push(box([leafWidth - 0.01, leafHeight, d * 0.45], [x, leafHeight / 2, d * 0.1], color, 'top'));
      const side = leafs === 1 ? 1 : leaf === 0 ? 1 : -1;
      parts.push({
        ...sphere(0.03, [x + side * (leafWidth / 2 - 0.1), handleHeight, d * 0.4], handle, 'decor'),
        metalness: 0.8,
        roughness: 0.3,
      });
    }
    return parts;
  }
}

export class WindowFactory extends FurnitureFactory {
  protected buildParts(w: number, d: number, h: number, color: string): Part[] {
    const sill = config.editor.windowSill;
    const middle = sill + h / 2;
    const parts: Part[] = [
      box([w, FRAME, d], [0, sill + FRAME / 2, 0], color, 'body'),
      box([w, FRAME, d], [0, sill + h - FRAME / 2, 0], color, 'body'),
      box([FRAME, h, d], [-(w - FRAME) / 2, middle, 0], color, 'body'),
      box([FRAME, h, d], [(w - FRAME) / 2, middle, 0], color, 'body'),
      box([w + 0.08, 0.04, d + 0.06], [0, sill - 0.02, 0.03], color, 'top'),
      {
        ...box([w - FRAME * 2, h - FRAME * 2, 0.02], [0, middle, 0], cssVar('--scene-glass'), 'glass'),
        opacity: 0.55,
        emissive: 0.6,
        roughness: 0.05,
        metalness: 0.1,
      },
    ];
    if (w >= 1) parts.push(box([FRAME * 0.6, h - FRAME * 2, d * 0.6], [0, middle, 0], color, 'body'));
    return parts;
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
  toilet: new ToiletFactory(),
  vanity: new VanityFactory(),
  bathtub: new BathtubFactory(),
  shower: new ShowerFactory(),
  mirror: new MirrorFactory(),
  fridge: new FridgeFactory(),
  stove: new StoveFactory(),
  counter: new CounterFactory(),
  wardrobe: new WardrobeFactory(),
  tv_stand: new TvStandFactory(),
  door: new DoorFactory(),
  window: new WindowFactory(),
};

const fallback = new BoxFactory();

export function furnitureFactoryFor(shape: string): FurnitureFactory {
  return FACTORIES[shape] ?? fallback;
}
