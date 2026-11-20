import { config } from '../config';
import type { EditTool, Redesign, RedesignInput, VariationOptions } from '../types/redesign';
import { apiClient } from './apiClient';

const aiOptions = { timeoutMs: config.aiTimeoutMs };

export const redesignService = {
  create(input: RedesignInput) {
    const form = new FormData();
    form.append('image', input.photo, 'room.jpg');
    form.append('room_type', input.roomType);
    form.append('style', input.style);
    form.append('keep_structure', String(input.keepStructure));
    if (input.palette.length) form.append('palette', input.palette.join(','));
    if (input.budget !== null) form.append('budget', String(input.budget));
    if (input.keepStructure && input.keepItems.trim()) form.append('keep_items', input.keepItems.trim());
    return apiClient.post<Redesign>('/redesigns', form, aiOptions);
  },
  history: (projectId: string) => apiClient.get<Redesign[]>(`/redesigns?project_id=${encodeURIComponent(projectId)}`),
  variation: (id: string, options?: VariationOptions) =>
    apiClient.post<Redesign>(`/redesigns/${id}/variations`, options, aiOptions),
  editTools: () => apiClient.get<EditTool[]>('/redesigns/edit-tools'),
  applyEdit: (id: string, tool: string, values: Record<string, string>) =>
    apiClient.post<Redesign>(`/redesigns/${id}/edits`, { tool, values }, aiOptions),
  retry: (id: string) => apiClient.post<Redesign>(`/redesigns/${id}/retry`, undefined, aiOptions),
};
