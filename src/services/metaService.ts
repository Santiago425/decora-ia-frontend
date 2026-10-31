import type { AppInfo } from '../types/meta';
import { apiClient } from './apiClient';

export const metaService = {
  info: () => apiClient.get<AppInfo>('/meta/info'),
};
