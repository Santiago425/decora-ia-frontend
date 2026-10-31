import type { ProjectSummary } from '../types/dashboard';
import type {
  NewProject,
  ProjectAction,
  ProjectDetail,
  SceneData,
  VersionDetail,
  VersionSummary,
} from '../types/project';
import { apiClient } from './apiClient';

export const projectService = {
  list: () => apiClient.get<ProjectSummary[]>('/projects'),
  get: (id: string) => apiClient.get<ProjectDetail>(`/projects/${id}`),
  create: (data: NewProject) => apiClient.post<ProjectDetail>('/projects', data),
  update: (id: string, data: Partial<Pick<NewProject, 'name' | 'style' | 'room_type'>>) =>
    apiClient.patch<ProjectDetail>(`/projects/${id}`, data),
  saveScene: (id: string, scene: SceneData) => apiClient.put<ProjectDetail>(`/projects/${id}/scene`, { scene }),
  changeStatus: (id: string, action: ProjectAction) =>
    apiClient.post<ProjectDetail>(`/projects/${id}/status`, { action }),
  duplicate: (id: string) => apiClient.post<ProjectDetail>(`/projects/${id}/duplicate`),
  remove: (id: string) => apiClient.delete<{ message: string }>(`/projects/${id}`),
  versions: (id: string) => apiClient.get<VersionSummary[]>(`/projects/${id}/versions`),
  saveVersion: (id: string, label: string) => apiClient.post<VersionDetail>(`/projects/${id}/versions`, { label }),
  version: (id: string, versionId: number) => apiClient.get<VersionDetail>(`/projects/${id}/versions/${versionId}`),
};
