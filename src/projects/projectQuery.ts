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
  oldest: {
    label: 'Más antiguos',
    compare: (a, b) => (a.created_at ?? a.updated_at).localeCompare(b.created_at ?? b.updated_at),
  },
} satisfies Record<string, SortStrategy>;

export type SortKey = keyof typeof SORT_STRATEGIES;
export type KindFilter = 'all' | 'redesign' | 'scene';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Time windows measured back from today on the project's last change. */
export const PERIODS = {
  all: { label: 'Cualquier fecha', days: null },
  week: { label: 'Últimos 7 días', days: 7 },
  month: { label: 'Últimos 30 días', days: 30 },
  quarter: { label: 'Últimos 3 meses', days: 90 },
} satisfies Record<string, { label: string; days: number | null }>;

export type PeriodKey = keyof typeof PERIODS;

/** Value used by the style and room filters to keep every option. */
export const ANY = 'all';

export interface ProjectQuery {
  text: string;
  status: ProjectStatus | 'all';
  kind: KindFilter;
  style: string;
  room: string;
  period: PeriodKey;
  sort: SortKey;
}

export const DEFAULT_QUERY: ProjectQuery = {
  text: '',
  status: 'all',
  kind: 'all',
  style: ANY,
  room: ANY,
  period: 'all',
  sort: 'recent',
};

/** Keeps photo redesigns or 3D-only rooms, so each section lists only its own projects. */
export function filterByKind(projects: ProjectSummary[], kind: KindFilter): ProjectSummary[] {
  return kind === 'all' ? projects : projects.filter((p) => (kind === 'redesign') === p.redesign_count > 0);
}

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const uniqueSorted = (values: (string | null)[]) =>
  [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b, 'es'));

/** Styles and rooms that the user's own projects use, so the filters only offer real options. */
export function facetOptions(projects: ProjectSummary[]): { styles: string[]; rooms: string[] } {
  return {
    styles: uniqueSorted(projects.map((p) => p.style_name)),
    rooms: uniqueSorted(projects.map((p) => p.room_type_name)),
  };
}

function withinPeriod(project: ProjectSummary, period: PeriodKey, now: number): boolean {
  const days = PERIODS[period].days;
  return days === null || now - Date.parse(project.updated_at) <= days * DAY_MS;
}

/** Number of filters that narrow the list, without counting the text search or the ordering. */
export function activeFilters(query: ProjectQuery): number {
  return (['status', 'kind', 'style', 'room', 'period'] as const).filter((key) => query[key] !== DEFAULT_QUERY[key])
    .length;
}

export function applyQuery(projects: ProjectSummary[], query: ProjectQuery, now = Date.now()): ProjectSummary[] {
  const text = normalize(query.text.trim());
  return filterByKind(projects, query.kind)
    .filter((p) => query.status === 'all' || p.status === query.status)
    .filter((p) => query.style === ANY || p.style_name === query.style)
    .filter((p) => query.room === ANY || p.room_type_name === query.room)
    .filter((p) => withinPeriod(p, query.period, now))
    .filter(
      (p) => !text || normalize([p.name, p.style_name, p.room_type_name].filter(Boolean).join(' ')).includes(text),
    )
    .sort(SORT_STRATEGIES[query.sort].compare);
}

const isKey = <T extends object>(record: T, value: string | null): value is Extract<keyof T, string> =>
  value !== null && Object.prototype.hasOwnProperty.call(record, value);

const STATUSES: Record<ProjectStatus | 'all', true> = { all: true, draft: true, in_design: true, finished: true };
const KINDS: Record<KindFilter, true> = { all: true, redesign: true, scene: true };

/** Reads a query from the address bar, ignoring unknown values, so filtered lists can be linked. */
export function queryFromParams(params: URLSearchParams): ProjectQuery {
  const status = params.get('status');
  const kind = params.get('kind');
  const period = params.get('period');
  const sort = params.get('sort');
  return {
    text: params.get('q') ?? DEFAULT_QUERY.text,
    status: isKey(STATUSES, status) ? status : DEFAULT_QUERY.status,
    kind: isKey(KINDS, kind) ? kind : DEFAULT_QUERY.kind,
    style: params.get('style') ?? DEFAULT_QUERY.style,
    room: params.get('room') ?? DEFAULT_QUERY.room,
    period: isKey(PERIODS, period) ? period : DEFAULT_QUERY.period,
    sort: isKey(SORT_STRATEGIES, sort) ? sort : DEFAULT_QUERY.sort,
  };
}

/** Writes only the values that differ from the defaults, keeping links short. */
export function queryToParams(query: ProjectQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.text.trim()) params.set('q', query.text);
  (['status', 'kind', 'style', 'room', 'period', 'sort'] as const).forEach((key) => {
    if (query[key] !== DEFAULT_QUERY[key]) params.set(key, query[key]);
  });
  return params;
}
