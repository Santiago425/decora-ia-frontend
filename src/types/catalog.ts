export interface Palette {
  id: number;
  name: string;
  colors: string[];
  style_id?: number | null;
}

export interface DesignStyle {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  palettes: Palette[];
}

export interface RoomType {
  id: number;
  slug: string;
  name: string;
  icon: string;
}
