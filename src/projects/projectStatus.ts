import type { ProjectStatus } from '../types/dashboard';

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  in_design: 'En diseño',
  finished: 'Terminado',
};
