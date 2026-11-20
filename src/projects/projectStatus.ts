import type { ProjectStatus, ProjectSummary } from '../types/dashboard';

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  in_design: 'En diseño',
  finished: 'Terminado',
};

/** Lifecycle order of a project, from first sketch to done. */
export const STATUS_ORDER: ProjectStatus[] = ['draft', 'in_design', 'finished'];

export interface StatusBreakdown {
  total: number;
  counts: Record<ProjectStatus, number>;
  finishedShare: number;
}

export function statusBreakdown(projects: ProjectSummary[]): StatusBreakdown {
  const counts: Record<ProjectStatus, number> = { draft: 0, in_design: 0, finished: 0 };
  projects.forEach((p) => {
    counts[p.status] += 1;
  });
  const total = projects.length;
  return { total, counts, finishedShare: total ? Math.round((counts.finished / total) * 100) : 0 };
}
