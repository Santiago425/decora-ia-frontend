export type RedesignStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface SuggestedItem {
  name: string;
  description: string;
  price: number;
}

export interface SuggestedColor {
  name: string;
  hex: string;
}

export interface DesignSuggestions {
  summary?: string;
  furniture?: SuggestedItem[];
  colors?: SuggestedColor[];
  materials?: SuggestedItem[];
  lighting?: SuggestedItem[];
}

export interface Redesign {
  id: string;
  project_id: string;
  project_name: string;
  status: RedesignStatus;
  style: { slug: string; name: string } | null;
  room_type: { slug: string; name: string } | null;
  original_image_url: string;
  result_image_url: string | null;
  palette: string[];
  budget: string | null;
  budget_tier: 'economic' | 'standard' | 'premium';
  keep_structure: boolean;
  keep_items: string | null;
  edit_tool: { slug: string; name: string } | null;
  suggestions: DesignSuggestions;
  estimated_total: string;
  error_message: string | null;
  created_at: string;
}

export interface RedesignInput {
  photo: Blob;
  roomType: string;
  style: string;
  palette: string[];
  budget: number | null;
  keepStructure: boolean;
  keepItems: string;
}

export interface VariationOptions {
  style?: string;
  palette?: string[];
  budget?: number | null;
  keep_structure?: boolean;
  keep_items?: string | null;
}

export interface EditFieldOption {
  slug: string;
  name: string;
  color_hex: string | null;
  texture_url: string | null;
}

export interface EditField {
  key: string;
  label: string;
  kind: 'color' | 'text' | 'material';
  placeholder: string;
  options: EditFieldOption[];
}

export interface EditTool {
  key: string;
  label: string;
  description: string;
  fields: EditField[];
}
