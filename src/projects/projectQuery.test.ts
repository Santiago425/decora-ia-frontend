import { describe, expect, it } from 'vitest';
import type { ProjectSummary } from '../types/dashboard';
import {
  activeFilters,
  applyQuery,
  DEFAULT_QUERY,
  facetOptions,
  filterByKind,
  queryFromParams,
  queryToParams,
  type ProjectQuery,
} from './projectQuery';

const project = (overrides: Partial<ProjectSummary>): ProjectSummary => ({
  id: overrides.name ?? 'p',
  name: 'Proyecto',
  status: 'draft',
  style_name: null,
  room_type_name: null,
  estimated_budget: '0',
  before_image_url: null,
  after_image_url: null,
  redesign_count: 0,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  ...overrides,
});

const projects = [
  project({
    name: 'Sala luminosa',
    style_name: 'Nórdico',
    estimated_budget: '500',
    updated_at: '2026-10-03T00:00:00Z',
  }),
  project({
    name: 'Cocina',
    status: 'finished',
    redesign_count: 2,
    estimated_budget: '900',
    updated_at: '2026-10-02T00:00:00Z',
  }),
  project({ name: 'Baño', status: 'in_design', estimated_budget: '100', updated_at: '2026-10-05T00:00:00Z' }),
];

describe('applyQuery', () => {
  it('sorts by the chosen strategy', () => {
    expect(applyQuery(projects, DEFAULT_QUERY).map((p) => p.name)).toEqual(['Baño', 'Sala luminosa', 'Cocina']);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, sort: 'budget' }).map((p) => p.name)).toEqual([
      'Cocina',
      'Sala luminosa',
      'Baño',
    ]);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, sort: 'name' })[0].name).toBe('Baño');
  });

  it('filters by status, kind and accent-insensitive text', () => {
    expect(applyQuery(projects, { ...DEFAULT_QUERY, status: 'finished' }).map((p) => p.name)).toEqual(['Cocina']);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, kind: 'scene' })).toHaveLength(2);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, text: 'nordico' }).map((p) => p.name)).toEqual(['Sala luminosa']);
  });
});

describe('filterByKind', () => {
  it('keeps each section to its own projects', () => {
    expect(filterByKind(projects, 'redesign').map((p) => p.name)).toEqual(['Cocina']);
    expect(filterByKind(projects, 'scene').map((p) => p.name)).toEqual(['Sala luminosa', 'Baño']);
    expect(filterByKind(projects, 'all')).toHaveLength(3);
  });
});

describe('style, room and date filters', () => {
  const now = Date.parse('2026-10-10T00:00:00Z');
  const catalog = [
    project({ name: 'Sala', style_name: 'Nórdico', room_type_name: 'Sala', updated_at: '2026-10-09T00:00:00Z' }),
    project({ name: 'Cocina', style_name: 'Industrial', room_type_name: 'Cocina', updated_at: '2026-09-20T00:00:00Z' }),
    project({ name: 'Estudio', style_name: 'Nórdico', room_type_name: 'Oficina', updated_at: '2026-05-01T00:00:00Z' }),
  ];
  const names = (query: Partial<ProjectQuery>) =>
    applyQuery(catalog, { ...DEFAULT_QUERY, ...query }, now).map((p) => p.name);

  it('keeps only the chosen style, room and period', () => {
    expect(names({ style: 'Nórdico' })).toEqual(['Sala', 'Estudio']);
    expect(names({ room: 'Cocina' })).toEqual(['Cocina']);
    expect(names({ period: 'week' })).toEqual(['Sala']);
    expect(names({ period: 'month' })).toEqual(['Sala', 'Cocina']);
    expect(names({ style: 'Nórdico', period: 'quarter' })).toEqual(['Sala']);
  });

  it('offers only the styles and rooms in use', () => {
    expect(facetOptions([...catalog, project({ name: 'Vacío' })])).toEqual({
      styles: ['Industrial', 'Nórdico'],
      rooms: ['Cocina', 'Oficina', 'Sala'],
    });
  });

  it('counts the active filters', () => {
    expect(activeFilters(DEFAULT_QUERY)).toBe(0);
    expect(activeFilters({ ...DEFAULT_QUERY, text: 'sala', sort: 'name' })).toBe(0);
    expect(activeFilters({ ...DEFAULT_QUERY, style: 'Nórdico', period: 'week' })).toBe(2);
  });
});

describe('query in the address bar', () => {
  it('round-trips the non-default values', () => {
    const query: ProjectQuery = {
      ...DEFAULT_QUERY,
      text: 'sala',
      status: 'finished',
      style: 'Nórdico',
      period: 'month',
    };
    const params = queryToParams(query);
    expect(params.toString()).toBe('q=sala&status=finished&style=N%C3%B3rdico&period=month');
    expect(queryFromParams(params)).toEqual(query);
    expect(queryToParams(DEFAULT_QUERY).toString()).toBe('');
  });

  it('ignores unknown values', () => {
    expect(queryFromParams(new URLSearchParams('status=lost&period=decade&sort=random&kind=x'))).toEqual(DEFAULT_QUERY);
  });
});
