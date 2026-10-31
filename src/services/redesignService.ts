import { config } from '../config';
import type { Redesign, RedesignInput } from '../types/redesign';
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
    return apiClient.post<Redesign>('/redesigns', form, aiOptions);
  },
  variation: (id: string) => apiClient.post<Redesign>(`/redesigns/${id}/variations`, undefined, aiOptions),
  retry: (id: string) => apiClient.post<Redesign>(`/redesigns/${id}/retry`, undefined, aiOptions),
};
