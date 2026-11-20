import type {
  AdminAddon,
  AdminFurniture,
  AdminStats,
  AdminStyle,
  AdminUser,
  AdminUserPage,
  FurnitureFilters,
  FurnitureInput,
  Page,
  ReportFormat,
  ReportKind,
  Role,
  UserFilters,
} from '../types/admin';
import { apiClient } from './apiClient';

/** Builds a query string and leaves out empty filters so the API applies its defaults. */
function query(filters: object): string {
  const entries = Object.entries(filters)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  return new URLSearchParams(entries).toString();
}

export const adminService = {
  stats: () => apiClient.get<AdminStats>('/admin/stats'),
  users: (filters: UserFilters) => apiClient.get<AdminUserPage>(`/admin/users?${query(filters)}`),
  updateUser: (id: string, data: { role?: Role; is_active?: boolean }) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}`, data),
  furniture: (filters: FurnitureFilters) => apiClient.get<Page<AdminFurniture>>(`/admin/furniture?${query(filters)}`),
  createFurniture: (data: FurnitureInput) => apiClient.post<AdminFurniture>('/admin/furniture', data),
  updateFurniture: (id: number, data: Partial<FurnitureInput> & { is_active?: boolean }) =>
    apiClient.patch<AdminFurniture>(`/admin/furniture/${id}`, data),
  styles: () => apiClient.get<AdminStyle[]>('/admin/styles'),
  updateStyle: (id: number, data: Partial<Omit<AdminStyle, 'id' | 'slug' | 'project_count'>>) =>
    apiClient.patch<AdminStyle>(`/admin/styles/${id}`, data),
  addons: () => apiClient.get<AdminAddon[]>('/admin/addons'),
  updateAddon: (id: number, data: { name?: string; price?: string; is_active?: boolean }) =>
    apiClient.patch<AdminAddon>(`/admin/addons/${id}`, data),
  report: (kind: ReportKind, format: ReportFormat) => apiClient.download(`/admin/reports/${kind}?format=${format}`),
};
