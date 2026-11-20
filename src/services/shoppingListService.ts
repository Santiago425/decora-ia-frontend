import type { ShoppingExportFormat, ShoppingList } from '../types/shopping';
import { apiClient } from './apiClient';

const base = (projectId: string) => `/projects/${projectId}/shopping-list`;

export const shoppingListService = {
  get: (projectId: string, includeRedesign: boolean) =>
    apiClient.get<ShoppingList>(`${base(projectId)}?include_redesign=${includeRedesign}`),
  setBudget: (projectId: string, amount: number | null, includeRedesign: boolean) =>
    apiClient.put<ShoppingList>(`${base(projectId)}/budget?include_redesign=${includeRedesign}`, { amount }),
  setPurchased: (projectId: string, keys: string[], includeRedesign: boolean) =>
    apiClient.put<ShoppingList>(`${base(projectId)}/purchased?include_redesign=${includeRedesign}`, { keys }),
  export: (projectId: string, format: ShoppingExportFormat, includeRedesign: boolean) =>
    apiClient.download(`${base(projectId)}/export?format=${format}&include_redesign=${includeRedesign}`),
};
