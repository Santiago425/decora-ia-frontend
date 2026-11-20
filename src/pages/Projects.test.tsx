// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectSummary } from '../types/dashboard';
import Projects from './Projects';

const service = vi.hoisted(() => ({ list: vi.fn(), update: vi.fn(), duplicate: vi.fn(), remove: vi.fn() }));
vi.mock('../services/projectService', () => ({ projectService: service }));
vi.mock('../components/patterns/PatternBadge', () => ({ PatternBadge: () => null }));
// The card's 3D tilt and photo are visual only; the page logic is what is checked here.
vi.mock('../components/dashboard/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: ProjectSummary }) => <span>{project.name}</span>,
}));

const project = (overrides: Partial<ProjectSummary>): ProjectSummary => ({
  id: 'p1',
  name: 'Sala nórdica',
  status: 'in_design',
  style_name: 'Nórdico',
  room_type_name: 'Sala',
  estimated_budget: '3000000',
  before_image_url: null,
  after_image_url: null,
  redesign_count: 0,
  created_at: '2026-11-01T10:00:00Z',
  updated_at: '2026-11-19T10:00:00Z',
  ...overrides,
});

const SALA = project({ id: 'p1', name: 'Sala nórdica' });
const COCINA = project({
  id: 'p2',
  name: 'Cocina industrial',
  status: 'finished',
  style_name: 'Industrial',
  room_type_name: 'Cocina',
  estimated_budget: '5000000',
  redesign_count: 2,
});

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/projects']}>
      <Routes>
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Projects page', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.list.mockResolvedValue([SALA, COCINA]);
  });

  it('lists the projects and opens each one where it was made', async () => {
    renderPage();
    const photo = await screen.findByRole('link', { name: 'Ver el rediseño de Cocina industrial' });
    expect(photo.getAttribute('href')).toBe('/redesign?project=p2');
    expect(screen.getByRole('link', { name: 'Abrir Sala nórdica en el editor 3D' }).getAttribute('href')).toBe(
      '/editor/p1',
    );
    expect(screen.getByText(/2 proyectos/)).toBeTruthy();
  });

  it('filters by text and status and clears the filters', async () => {
    renderPage();
    await screen.findByText('Sala nórdica');
    await userEvent.type(screen.getByLabelText('Buscar proyectos'), 'cocina');
    expect(screen.queryByText('Sala nórdica')).toBeNull();
    expect(screen.getByText('Cocina industrial')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'En diseño' }));
    expect(screen.getByText('Nada coincide con tu búsqueda')).toBeTruthy();

    await userEvent.click(screen.getAllByRole('button', { name: /Limpiar filtros/ })[0]);
    expect(screen.getByText('Sala nórdica')).toBeTruthy();
    expect(screen.getByText('Cocina industrial')).toBeTruthy();
  });

  it('shows only the photo redesigns when that type is chosen', async () => {
    renderPage();
    await screen.findByText('Sala nórdica');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de proyecto'), 'redesign');
    expect(screen.queryByText('Sala nórdica')).toBeNull();
    expect(screen.getByText('Cocina industrial')).toBeTruthy();
  });

  it('renames a project', async () => {
    service.update.mockResolvedValue({});
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Cambiar nombre de Sala nórdica' }));
    const input = screen.getByLabelText('Nuevo nombre');
    await userEvent.clear(input);
    await userEvent.type(input, 'Sala de Ana{Enter}');
    expect(service.update).toHaveBeenCalledWith('p1', { name: 'Sala de Ana' });
    expect(await screen.findByText('Sala de Ana')).toBeTruthy();
  });

  it('asks before deleting and removes the project', async () => {
    service.remove.mockResolvedValue({ message: 'ok' });
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar Sala nórdica' }));
    expect(screen.getByText('¿Eliminar este proyecto?')).toBeTruthy();
    expect(service.remove).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(service.remove).toHaveBeenCalledWith('p1');
    await vi.waitFor(() => expect(screen.queryByText('Sala nórdica')).toBeNull());
  });

  it('duplicates a project and reloads the list', async () => {
    const copy = project({ id: 'p3', name: 'Sala nórdica (copia)' });
    service.duplicate.mockResolvedValue({});
    renderPage();
    await screen.findByText('Sala nórdica');
    service.list.mockResolvedValue([copy, SALA, COCINA]);
    await userEvent.click(screen.getByRole('button', { name: 'Duplicar Sala nórdica' }));
    expect(service.duplicate).toHaveBeenCalledWith('p1');
    expect(await screen.findByText('Sala nórdica (copia)')).toBeTruthy();
  });

  it('invites to create the first project when there are none', async () => {
    service.list.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Todavía no tienes proyectos')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Crear mi primer proyecto/ }).getAttribute('href')).toBe('/editor');
  });

  it('shows the error and lets the user retry', async () => {
    service.list.mockRejectedValueOnce(new Error('No hay conexión con el servidor'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('No hay conexión con el servidor');
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByText('Sala nórdica')).toBeTruthy();
  });
});
