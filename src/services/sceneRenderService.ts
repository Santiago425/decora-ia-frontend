import { config } from '../config';
import type { SceneRender } from '../types/project';
import { apiClient } from './apiClient';

const aiOptions = { timeoutMs: config.aiTimeoutMs };

export const sceneRenderService = {
  list: (projectId: string) => apiClient.get<SceneRender[]>(`/projects/${projectId}/renders`),
  create(projectId: string, capture: Blob) {
    const form = new FormData();
    form.append('image', capture, 'scene.jpg');
    return apiClient.post<SceneRender>(`/projects/${projectId}/renders`, form, aiOptions);
  },
};
