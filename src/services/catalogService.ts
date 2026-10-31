import type { DesignStyle, Palette, RoomType } from '../types/catalog';
import { apiClient } from './apiClient';

export const catalogService = {
  styles: () => apiClient.get<DesignStyle[]>('/catalog/styles'),
  roomTypes: () => apiClient.get<RoomType[]>('/catalog/room-types'),
  palettes: () => apiClient.get<Palette[]>('/catalog/palettes'),
};
