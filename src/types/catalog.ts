export interface Palette {
  id: number;
  name: string;
  colors: string[];
}

export interface DesignStyle {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  palettes: Palette[];
}
