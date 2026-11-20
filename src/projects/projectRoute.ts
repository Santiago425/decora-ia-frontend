import type { ProjectSummary } from '../types/dashboard';

type RoutableProject = Pick<ProjectSummary, 'id' | 'name' | 'redesign_count'>;

export function isPhotoProject(project: RoutableProject) {
  return project.redesign_count > 0;
}

export function projectPath(project: RoutableProject) {
  return isPhotoProject(project) ? `/redesign?project=${project.id}` : `/editor/${project.id}`;
}

export function projectLabel(project: RoutableProject) {
  return isPhotoProject(project) ? `Ver el rediseño de ${project.name}` : `Abrir ${project.name} en el editor 3D`;
}
