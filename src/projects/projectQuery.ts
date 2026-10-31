import type { ProjectStatus, ProjectSummary } from '../types/dashboard';

export interface SortStrategy {
  label: string;
  compare: (a: ProjectSummary, b: ProjectSummary) => number;
}

// Strategy: each ordering is an interchangeable object; the page only asks the chosen one to compare.
export const SORT_STRATEGIES = {
  recent: { label: 'Más recientes', compare: (a, b) => b.updated_at.localeCompare(a.updated_at) },
  name: { label: 'Nombre (A-Z)', compare: (a, b) => a.name.localeCompare(b.name, 'es') },
  budget: { label: 'Mayor presupuesto', compare: (a, b) => Number(b.estimated_budget) - Number(a.estimated_budget) },
  oldest: { label: 'Más antiguos', compare: (a, b) => (a.created_at ?? a.updated_at).localeCompare(b.created_at ?? b.updated_at) },
} satisfies Record<string, SortStrategy>;

export type SortKey = keyof typeof SORT_STRATEGIES;
export type KindFilter = 'all' | 'redesign' | 'scene';

export interface ProjectQuery {
  text: string;
  status: ProjectStatus | 'all';
  kind: KindFilter;
  sort: SortKey;
}

export const DEFAULT_QUERY: ProjectQuery = { text: '', status: 'all', kind: 'all', sort: 'recent' };

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function applyQuery(projects: ProjectSummary[], query: ProjectQuery): ProjectSummary[] {
  const text = normalize(query.text.trim());
  return projects
    .filter((p) => query.status === 'all' || p.status === query.status)
    .filter((p) => query.kind === 'all' || (query.kind === 'redesign') === p.redesign_count > 0)
    .filter((p) => !text || normalize([p.name, p.style_name, p.room_type_name].filter(Boolean).join(' ')).includes(text))
    .sort(SORT_STRATEGIES[query.sort].compare);
}
