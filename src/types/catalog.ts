export interface Palette {
  id: number;
  name: string;
  colors: string[];
  style_id?: number | null;
}

export type MaterialSurface = 'wall' | 'floor' | 'furniture';

export interface Material {
  id: number;
  slug: string;
  name: string;
  surface: MaterialSurface;
  color_hex: string;
  roughness: number;
  metalness: number;
  price_per_unit: string;
}

export interface DesignStyle {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  lighting_color: string;
  lighting_intensity: number;
  palettes: Palette[];
  materials: Material[];
}

export interface RoomType {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

export interface FurnitureCategory {
  id: number;
  slug: string;
  name: string;
  icon: string;
  shape: string;
  room_types: string[];
}

export interface FurnitureItem {
  id: number;
  name: string;
  description: string;
  price: string;
  width: number;
  depth: number;
  height: number;
  default_color: string;
  model_url: string | null;
  category: FurnitureCategory;
}

export type AddonVisual = 'cushions' | 'throw' | 'glass' | 'legs' | 'glow' | 'pot' | 'none';

export interface FurnitureAddon {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  visual: AddonVisual;
  color_hex: string | null;
  categories: string[];
}
