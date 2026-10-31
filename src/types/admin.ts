import type { FurnitureCategory } from './catalog';

export type Role = 'user' | 'admin';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  project_count: number;
}

export interface AdminUserPage {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface DailyPoint {
  day: string;
  projects: number;
  redesigns: number;
  users: number;
}

export interface ProviderInfo {
  text: string;
  image: string;
  storage: string;
}

export interface AdminStats {
  totals: { users: number; projects: number; redesigns: number; assistant_messages: number };
  active_users: number;
  new_users: number;
  users_by_role: Partial<Record<Role, number>>;
  projects_by_status: Record<string, number>;
  redesigns_by_status: Record<string, number>;
  top_styles: { slug: string; name: string; count: number }[];
  daily: DailyPoint[];
  providers: ProviderInfo;
  days: number;
}

export interface AdminFurniture {
  id: number;
  name: string;
  description: string;
  price: string;
  width: number;
  depth: number;
  height: number;
  default_color: string;
  is_active: boolean;
  category: FurnitureCategory;
}

export interface FurnitureInput {
  category: string;
  name: string;
  description: string;
  price: string;
  width: number;
  depth: number;
  height: number;
  default_color: string;
}

export interface AdminStyle {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  lighting_color: string;
  lighting_intensity: number;
  is_active: boolean;
  project_count: number;
}

export interface AdminAddon {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  is_active: boolean;
  categories: string[];
}

export type ReportKind = 'usuarios' | 'proyectos';
