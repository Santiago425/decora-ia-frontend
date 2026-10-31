import type { DesignStyle } from '../types/catalog';
import { apiClient } from './apiClient';

export const catalogService = {
  styles: () => apiClient.get<DesignStyle[]>('/catalog/styles'),
};
