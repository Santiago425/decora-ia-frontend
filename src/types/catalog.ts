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
  texture_url?: string | null;
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

/** A time of day for the 3D editor: sun position and color, sky, and how bright windows and lamps are. */
export interface DaylightPreset {
  id: number;
  slug: string;
  name: string;
  description: string;
  sun_color: string;
  sun_intensity: number;
  sun_elevation: number;
  sun_azimuth: number;
  ambient_color: string;
  ambient_intensity: number;
  sky_color: string;
  window_intensity: number;
  lamp_intensity: number;
}

export interface RoomType {
  id: number;
  slug: string;
  name: string;
  icon: string;
  cover_image_url?: string | null;
}

export interface FurnitureCategory {
  id: number;
  slug: string;
  name: string;
  icon: string;
  shape: string;
  room_types: string[];
  /** False for pieces that hang on the wall, such as art, curtains or a TV. */
  blocks_floor?: boolean;
}

export interface ColorOption {
  name: string;
  hex: string;
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
  materials?: string;
  color_options?: ColorOption[];
  finish_options?: string[];
  category: FurnitureCategory;
}

export type AddonVisual =
  | 'cushions'
  | 'throw'
  | 'glass'
  | 'legs'
  | 'glow'
  | 'pot'
  | 'books'
  | 'vase'
  | 'runner'
  | 'lamp'
  | 'succulent'
  | 'towels'
  | 'headboard'
  | 'duvet'
  | 'frame'
  | 'sheer'
  | 'soundbar'
  | 'none';

export interface FurnitureAddon {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  visual: AddonVisual;
  icon?: string;
  color_hex: string | null;
  categories: string[];
}

export interface CatalogRef {
  slug: string;
  name: string;
}

export interface InspirationPhoto {
  id: number;
  title: string;
  image_url: string;
  author_name: string;
  source_url: string | null;
  style: CatalogRef | null;
  room_type: CatalogRef | null;
}
