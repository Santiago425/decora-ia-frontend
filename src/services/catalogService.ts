import type {
  DesignStyle,
  FurnitureAddon,
  FurnitureCategory,
  FurnitureItem,
  Material,
  Palette,
  RoomType,
} from '../types/catalog';
import { apiClient } from './apiClient';

export const catalogService = {
  styles: () => apiClient.get<DesignStyle[]>('/catalog/styles'),
  roomTypes: () => apiClient.get<RoomType[]>('/catalog/room-types'),
  palettes: () => apiClient.get<Palette[]>('/catalog/palettes'),
  categories: () => apiClient.get<FurnitureCategory[]>('/catalog/furniture-categories'),
  furniture: () => apiClient.get<FurnitureItem[]>('/catalog/furniture'),
  materials: () => apiClient.get<Material[]>('/catalog/materials'),
  addons: () => apiClient.get<FurnitureAddon[]>('/catalog/addons'),
};
