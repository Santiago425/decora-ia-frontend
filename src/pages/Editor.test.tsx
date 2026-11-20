// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assistantBus } from '../assistant/assistantBus';
import type { FurnitureCategory, FurnitureItem } from '../types/catalog';
import type { ProjectDetail, SceneData, SceneNodeData } from '../types/project';
import Editor from './Editor';

const projects = vi.hoisted(() => ({
  get: vi.fn(),
  versions: vi.fn(),
  saveScene: vi.fn(),
  update: vi.fn(),
  changeStatus: vi.fn(),
  saveVersion: vi.fn(),
  version: vi.fn(),
}));
const catalog = vi.hoisted(() => ({
  furniture: vi.fn(),
  categories: vi.fn(),
  materials: vi.fn(),
  addons: vi.fn(),
  styles: vi.fn(),
}));
vi.mock('../services/projectService', () => ({ projectService: projects }));
vi.mock('../services/catalogService', () => ({ catalogService: catalog }));
vi.mock('../components/patterns/PatternBadge', () => ({ PatternBadge: () => null }));
vi.mock('../components/editor/FurnitureThumb', () => ({ FurnitureThumb: () => null }));
// WebGL does not run in jsdom: the stand-in canvas lists the pieces and lets the test pick one.
vi.mock('../components/editor/EditorCanvas', () => ({
  EditorCanvas: ({ scene, onSelect }: { scene: SceneData; onSelect: (id: string, additive: boolean) => void }) => (
    <ul aria-label="Muebles en la escena">
      {scene.nodes.map((node: SceneNodeData) => (
        <li key={node.id}>
          <button onClick={() => onSelect(node.id, false)}>{node.name}</button>
        </li>
      ))}
    </ul>
  ),
}));

const SOFAS: FurnitureCategory = {
  id: 1,
  slug: 'sofas',
  name: 'Sofás',
  icon: 'sofa',
  shape: 'sofa',
  room_types: ['living-room'],
};
const BEDS: FurnitureCategory = {
  id: 2,
  slug: 'beds',
  name: 'Camas',
  icon: 'bed',
  shape: 'bed',
  room_types: ['bedroom'],
};

const item = (id: number, name: string, category: FurnitureCategory): FurnitureItem => ({
  id,
  name,
  description: '',
  price: '1000000',
  width: 2,
  depth: 0.9,
  height: 0.8,
  default_color: '#cccccc',
  model_url: null,
  category,
});

const SCENE: SceneData = {
  format: 1,
  style: null,
  room: { width: 5, length: 4, height: 2.6, wall_material: null, floor_material: null },
  lighting: { color: '#fff6e8', intensity: 1 },
  nodes: [],
};

const project = (overrides: Partial<ProjectDetail> = {}): ProjectDetail => ({
  id: 'p1',
  name: 'Sala de Laura',
  status: 'in_design',
  actions: ['finish'],
  style: null,
  room_type: { slug: 'living-room', name: 'Sala' },
  estimated_budget: '0',
  scene: SCENE,
  cover_image_url: null,
  created_at: '2026-11-20T10:00:00Z',
  updated_at: '2026-11-20T10:00:00Z',
  ...overrides,
});

function renderEditor() {
  render(
    <MemoryRouter initialEntries={['/editor/p1']}>
      <Routes>
        <Route path="/editor/:projectId" element={<Editor />} />
      </Routes>
    </MemoryRouter>,
  );
}

const scene = () => screen.findByRole('list', { name: 'Muebles en la escena' });

describe('3D editor page', () => {
  beforeEach(() => {
    Object.values(projects).forEach((fn) => fn.mockReset());
    Object.values(catalog).forEach((fn) => fn.mockReset());
    projects.get.mockResolvedValue(project());
    projects.versions.mockResolvedValue([]);
    projects.saveScene.mockImplementation(async (_id: string, data: SceneData) => project({ scene: data }));
    catalog.furniture.mockResolvedValue([item(1, 'Sofá Oslo', SOFAS), item(2, 'Cama Nube', BEDS)]);
    catalog.categories.mockResolvedValue([SOFAS, BEDS]);
    catalog.materials.mockResolvedValue([]);
    catalog.addons.mockResolvedValue([]);
    catalog.styles.mockResolvedValue([]);
  });

  it('suggests the furniture that fits the room type', async () => {
    renderEditor();
    expect(await screen.findByTitle('Agregar Sofá Oslo')).toBeTruthy();
    expect(screen.queryByTitle('Agregar Cama Nube')).toBeNull();
    await userEvent.click(screen.getByRole('tab', { name: 'Todos' }));
    expect(screen.getByTitle('Agregar Cama Nube')).toBeTruthy();
  });

  it('adds a piece, undoes and redoes it', async () => {
    renderEditor();
    await userEvent.click(await screen.findByTitle('Agregar Sofá Oslo'));
    const list = await scene();
    expect(list.textContent).toContain('Sofá Oslo');
    expect(screen.getByText('Cambios sin guardar')).toBeTruthy();

    await userEvent.click(screen.getByTitle('Deshacer: Agregar Sofá Oslo (Ctrl + Z)'));
    expect(list.textContent).not.toContain('Sofá Oslo');
    await userEvent.click(screen.getByTitle('Rehacer: Agregar Sofá Oslo (Ctrl + Y)'));
    expect(list.textContent).toContain('Sofá Oslo');
  });

  it('removes the selected piece from the inspector', async () => {
    renderEditor();
    await userEvent.click(await screen.findByTitle('Agregar Sofá Oslo'));
    await userEvent.click(screen.getByTitle('Eliminar (Supr)'));
    expect((await scene()).textContent).not.toContain('Sofá Oslo');
  });

  it('saves the scene on its own after a change', async () => {
    renderEditor();
    await userEvent.click(await screen.findByTitle('Agregar Sofá Oslo'));
    await vi.waitFor(() => expect(projects.saveScene).toHaveBeenCalled(), { timeout: 4000 });
    const [id, saved] = projects.saveScene.mock.calls[0] as [string, SceneData];
    expect(id).toBe('p1');
    expect(saved.nodes.map((node) => node.name)).toEqual(['Sofá Oslo']);
    expect(await screen.findByText('Guardado')).toBeTruthy();
  });

  it('runs what Lumi asks for inside the editor', async () => {
    renderEditor();
    await screen.findByTitle('Agregar Sofá Oslo');
    const outcome = assistantBus.publish({ type: 'add_furniture', params: { furniture_id: 1 } });
    expect(outcome).toBe('done');
    expect((await scene()).textContent).toContain('Sofá Oslo');
  });

  it('opens a finished project in read only mode', async () => {
    projects.get.mockResolvedValue(project({ status: 'finished', actions: ['reopen'] }));
    renderEditor();
    expect(await screen.findByText(/Proyecto terminado: solo lectura/)).toBeTruthy();
    expect(screen.getByTitle('Agregar Sofá Oslo').hasAttribute('disabled')).toBe(true);
  });

  it('shows the loading error with a way back', async () => {
    projects.get.mockRejectedValueOnce(new Error('No encontramos ese proyecto'));
    renderEditor();
    expect((await screen.findByRole('alert')).textContent).toContain('No encontramos ese proyecto');
    expect(screen.getByRole('link', { name: 'Volver' }).getAttribute('href')).toBe('/editor');
  });
});
