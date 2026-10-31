import type {
  AdminAddon,
  AdminFurniture,
  AdminStats,
  AdminStyle,
  AdminUser,
  AdminUserPage,
  FurnitureInput,
  ReportKind,
  Role,
} from '../types/admin';
import { apiClient } from './apiClient';

export const adminService = {
  stats: () => apiClient.get<AdminStats>('/admin/stats'),
  users: (search: string, page: number) =>
    apiClient.get<AdminUserPage>(`/admin/users?${new URLSearchParams({ search, page: String(page) })}`),
  updateUser: (id: string, data: { role?: Role; is_active?: boolean }) => apiClient.patch<AdminUser>(`/admin/users/${id}`, data),
  furniture: () => apiClient.get<AdminFurniture[]>('/admin/furniture'),
  createFurniture: (data: FurnitureInput) => apiClient.post<AdminFurniture>('/admin/furniture', data),
  updateFurniture: (id: number, data: Partial<FurnitureInput> & { is_active?: boolean }) =>
    apiClient.patch<AdminFurniture>(`/admin/furniture/${id}`, data),
  styles: () => apiClient.get<AdminStyle[]>('/admin/styles'),
  updateStyle: (id: number, data: Partial<Omit<AdminStyle, 'id' | 'slug' | 'project_count'>>) =>
    apiClient.patch<AdminStyle>(`/admin/styles/${id}`, data),
  addons: () => apiClient.get<AdminAddon[]>('/admin/addons'),
  updateAddon: (id: number, data: { name?: string; price?: string; is_active?: boolean }) =>
    apiClient.patch<AdminAddon>(`/admin/addons/${id}`, data),
  report: (kind: ReportKind) => apiClient.download(`/admin/reports/${kind}`),
};
