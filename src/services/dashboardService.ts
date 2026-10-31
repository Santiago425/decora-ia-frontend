import type { Dashboard } from '../types/dashboard';
import { apiClient } from './apiClient';

export const dashboardService = {
  overview: () => apiClient.get<Dashboard>('/dashboard'),
};
