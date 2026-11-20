import type {
  DaylightPreset,
  DesignStyle,
  FurnitureAddon,
  FurnitureCategory,
  FurnitureItem,
  InspirationPhoto,
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
  daylight: () => apiClient.get<DaylightPreset[]>('/catalog/daylight'),
  inspiration: () => apiClient.get<InspirationPhoto[]>('/catalog/inspiration'),
};
