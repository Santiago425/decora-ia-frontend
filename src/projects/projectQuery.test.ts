import { describe, expect, it } from 'vitest';
import type { ProjectSummary } from '../types/dashboard';
import { applyQuery, DEFAULT_QUERY } from './projectQuery';

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
  project({ name: 'Sala luminosa', style_name: 'Nórdico', estimated_budget: '500', updated_at: '2026-10-03T00:00:00Z' }),
  project({ name: 'Cocina', status: 'finished', redesign_count: 2, estimated_budget: '900', updated_at: '2026-10-02T00:00:00Z' }),
  project({ name: 'Baño', status: 'in_design', estimated_budget: '100', updated_at: '2026-10-05T00:00:00Z' }),
];

describe('applyQuery', () => {
  it('sorts by the chosen strategy', () => {
    expect(applyQuery(projects, DEFAULT_QUERY).map((p) => p.name)).toEqual(['Baño', 'Sala luminosa', 'Cocina']);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, sort: 'budget' }).map((p) => p.name)).toEqual(['Cocina', 'Sala luminosa', 'Baño']);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, sort: 'name' })[0].name).toBe('Baño');
  });

  it('filters by status, kind and accent-insensitive text', () => {
    expect(applyQuery(projects, { ...DEFAULT_QUERY, status: 'finished' }).map((p) => p.name)).toEqual(['Cocina']);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, kind: 'scene' })).toHaveLength(2);
    expect(applyQuery(projects, { ...DEFAULT_QUERY, text: 'nordico' }).map((p) => p.name)).toEqual(['Sala luminosa']);
  });
});
