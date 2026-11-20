// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { ProjectSummary } from '../../types/dashboard';
import { statusBreakdown } from '../../projects/projectStatus';
import { ProjectProgress } from './ProjectProgress';

const project = (id: string, status: ProjectSummary['status']): ProjectSummary => ({
  id,
  name: id,
  status,
  style_name: null,
  room_type_name: null,
  estimated_budget: '0',
  before_image_url: null,
  after_image_url: null,
  redesign_count: 0,
  created_at: null,
  updated_at: '2026-10-01T00:00:00Z',
});

const projects = [project('a', 'draft'), project('b', 'finished'), project('c', 'finished'), project('d', 'in_design')];

describe('statusBreakdown', () => {
  it('counts each state and the finished share', () => {
    expect(statusBreakdown(projects)).toEqual({
      total: 4,
      counts: { draft: 1, in_design: 1, finished: 2 },
      finishedShare: 50,
    });
    expect(statusBreakdown([]).finishedShare).toBe(0);
  });
});

describe('ProjectProgress', () => {
  it('links each state to its filtered project list', () => {
    render(
      <MemoryRouter>
        <ProjectProgress projects={projects} />
      </MemoryRouter>,
    );
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Terminado/ }).getAttribute('href')).toBe('/projects?status=finished');
    expect(screen.getByText('2 proyectos esperan a que los termines.')).toBeTruthy();
  });

  it('renders nothing without projects', () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectProgress projects={[]} />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe('');
  });
});
