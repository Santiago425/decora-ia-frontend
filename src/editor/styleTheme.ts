import type { DesignStyle, Material, MaterialSurface } from '../types/catalog';
import type { LightingData } from '../types/project';

export interface SurfaceFinish {
  slug: string | null;
  color: string;
  roughness: number;
  metalness: number;
}

// Abstract Factory: each style produces a matching family of lighting, wall, floor and accent colors.
export interface StyleThemeFactory {
  readonly slug: string | null;
  createLighting(): LightingData;
  createWallFinish(): SurfaceFinish;
  createFloorFinish(): SurfaceFinish;
  createAccentPalette(): string[];
}

const toFinish = (material: Material | undefined, fallbackColor: string): SurfaceFinish =>
  material
    ? { slug: material.slug, color: material.color_hex, roughness: material.roughness, metalness: material.metalness }
    : { slug: null, color: fallbackColor, roughness: 0.9, metalness: 0 };

const firstOf = (materials: Material[], surface: MaterialSurface) => materials.find((m) => m.surface === surface);

export class CatalogStyleTheme implements StyleThemeFactory {
  constructor(
    private readonly style: DesignStyle,
    private readonly catalog: Material[],
  ) {}

  get slug() {
    return this.style.slug;
  }

  createLighting(): LightingData {
    return { color: this.style.lighting_color, intensity: this.style.lighting_intensity };
  }

  createWallFinish(): SurfaceFinish {
    return toFinish(firstOf(this.style.materials, 'wall') ?? firstOf(this.catalog, 'wall'), NEUTRAL.wall);
  }

  createFloorFinish(): SurfaceFinish {
    return toFinish(firstOf(this.style.materials, 'floor') ?? firstOf(this.catalog, 'floor'), NEUTRAL.floor);
  }

  createAccentPalette(): string[] {
    return this.style.palettes[0]?.colors ?? [];
  }
}

const NEUTRAL = { wall: '#f2ede4', floor: '#c8a27a', light: '#fff4e0' };

export class NeutralStyleTheme implements StyleThemeFactory {
  readonly slug = null;

  constructor(private readonly catalog: Material[]) {}

  createLighting(): LightingData {
    return { color: NEUTRAL.light, intensity: 1 };
  }

  createWallFinish(): SurfaceFinish {
    return toFinish(firstOf(this.catalog, 'wall'), NEUTRAL.wall);
  }

  createFloorFinish(): SurfaceFinish {
    return toFinish(firstOf(this.catalog, 'floor'), NEUTRAL.floor);
  }

  createAccentPalette(): string[] {
    return [];
  }
}

export function themeFactoryFor(style: DesignStyle | undefined, catalog: Material[]): StyleThemeFactory {
  return style ? new CatalogStyleTheme(style, catalog) : new NeutralStyleTheme(catalog);
}

export function surfaceFinish(slug: string | null, materials: Map<string, Material>, fallbackColor: string): SurfaceFinish {
  return toFinish(slug ? materials.get(slug) : undefined, fallbackColor);
}

export const NEUTRAL_COLORS = NEUTRAL;
