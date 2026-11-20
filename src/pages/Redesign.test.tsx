// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DesignStyle, RoomType } from '../types/catalog';
import type { Redesign as RedesignResult } from '../types/redesign';
import type * as ImageUtils from '../utils/image';
import Redesign from './Redesign';

const catalog = vi.hoisted(() => ({ roomTypes: vi.fn(), styles: vi.fn() }));
const redesigns = vi.hoisted(() => ({
  create: vi.fn(),
  history: vi.fn(),
  variation: vi.fn(),
  retry: vi.fn(),
  remove: vi.fn(),
  editTools: vi.fn(),
  applyEdit: vi.fn(),
  applyInspiration: vi.fn(),
}));

vi.mock('../services/catalogService', () => ({ catalogService: catalog }));
vi.mock('../services/redesignService', () => ({ redesignService: redesigns }));
vi.mock('../services/projectService', () => ({
  projectService: { list: vi.fn().mockResolvedValue([]), remove: vi.fn() },
}));
vi.mock('../utils/image', async (original) => ({
  ...(await original<typeof ImageUtils>()),
  shrinkImage: vi.fn(async (file: Blob) => file),
}));
// The animated progress, the comparison slider and the recent list have their own checks.
vi.mock('../components/redesign/RedesignProgress', () => ({ RedesignProgress: () => <p>Generando rediseño</p> }));
vi.mock('../components/redesign/BeforeAfter', () => ({
  BeforeAfter: ({ before, after }: { before: string; after: string }) => (
    <div>
      <img src={before} alt="Foto original" />
      <img src={after} alt="Propuesta de la IA" />
    </div>
  ),
}));
vi.mock('../components/redesign/RecentRedesigns', () => ({ RecentRedesigns: () => null }));
vi.mock('../components/patterns/PatternBadge', () => ({ PatternBadge: () => null }));

const ROOMS: RoomType[] = [
  { id: 1, slug: 'living-room', name: 'Sala', icon: 'sofa' },
  { id: 2, slug: 'bedroom', name: 'Dormitorio', icon: 'bed' },
];

const style = (id: number, slug: string, name: string): DesignStyle => ({
  id,
  slug,
  name,
  description: '',
  image_url: null,
  lighting_color: '#ffffff',
  lighting_intensity: 1,
  palettes: [{ id: id * 10, name: `Paleta ${name}`, colors: ['#111111', '#eeeeee'] }],
  materials: [],
});

const STYLES = [style(1, 'nordic', 'Nórdico'), style(2, 'industrial', 'Industrial')];

function redesign(overrides: Partial<RedesignResult> = {}): RedesignResult {
  return {
    id: 'r1',
    project_id: 'p1',
    project_name: 'Sala industrial',
    status: 'ready',
    style: { slug: 'industrial', name: 'Industrial' },
    room_type: { slug: 'living-room', name: 'Sala' },
    original_image_url: 'https://cdn.test/antes.jpg',
    result_image_url: 'https://cdn.test/despues.jpg',
    palette: ['#111111', '#eeeeee'],
    budget: null,
    budget_tier: 'standard',
    keep_structure: true,
    keep_items: null,
    edit_tool: null,
    suggestions: {
      summary: 'Sala con ladrillo y cuero',
      furniture: [{ name: 'Sofá de cuero', description: '', price: 2500000 }],
    },
    estimated_total: '2500000',
    error_message: null,
    created_at: '2026-11-20T12:00:00Z',
    ...overrides,
  };
}

function renderPage(path = '/redesign') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/redesign" element={<Redesign />} />
      </Routes>
    </MemoryRouter>,
  );
}

function fileInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type=file]');
  if (!input) throw new Error('No hay campo para subir la foto');
  return input;
}

const photo = () => new File(['foto'], 'sala.jpg', { type: 'image/jpeg' });

describe('Redesign page', () => {
  beforeEach(() => {
    Object.values(catalog).forEach((fn) => fn.mockReset());
    Object.values(redesigns).forEach((fn) => fn.mockReset());
    catalog.roomTypes.mockResolvedValue(ROOMS);
    catalog.styles.mockResolvedValue(STYLES);
    URL.createObjectURL = vi.fn(() => 'blob:vista-previa');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it('keeps the button disabled until a photo is chosen', async () => {
    renderPage();
    expect(await screen.findByRole('button', { name: 'Ambiente de estilo Nórdico Nórdico' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Rediseñar mi espacio/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Sube una foto para continuar')).toBeTruthy();
  });

  it('rejects files that are not photos', async () => {
    renderPage();
    await screen.findByRole('button', { name: 'Ambiente de estilo Nórdico Nórdico' });
    const input = fileInput();
    await userEvent.upload(input, new File(['%PDF'], 'plano.pdf', { type: 'application/pdf' }), { applyAccept: false });
    expect((await screen.findByRole('alert')).textContent).toBe('Sube una foto en formato JPG, PNG o WEBP');
  });

  it('sends the photo with the chosen room and style and shows the before and after', async () => {
    redesigns.create.mockResolvedValue(redesign());
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Dormitorio' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ambiente de estilo Industrial Industrial' }));
    await userEvent.upload(fileInput(), photo());
    await userEvent.click(screen.getByRole('button', { name: /Rediseñar mi espacio/ }));

    expect(redesigns.create).toHaveBeenCalledWith(
      expect.objectContaining({ roomType: 'bedroom', style: 'industrial', palette: ['#111111', '#eeeeee'] }),
    );
    expect(await screen.findByRole('heading', { name: 'Sala industrial' })).toBeTruthy();
    expect(screen.getByAltText('Propuesta de la IA').getAttribute('src')).toBe('https://cdn.test/despues.jpg');
    expect(screen.getByText('Sofá de cuero')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Seguir en el editor 3D/ }).getAttribute('href')).toBe('/editor/p1');
  });

  it('shows the server message when the redesign fails', async () => {
    redesigns.create.mockRejectedValue(new Error('El servicio de imágenes no respondió'));
    renderPage();
    await screen.findByRole('button', { name: 'Ambiente de estilo Nórdico Nórdico' });
    await userEvent.upload(fileInput(), photo());
    await userEvent.click(screen.getByRole('button', { name: /Rediseñar mi espacio/ }));
    expect((await screen.findByRole('alert')).textContent).toBe('El servicio de imágenes no respondió');
  });

  it('opens a saved project and retries a redesign that ended with an error', async () => {
    const failed = redesign({ status: 'error', result_image_url: null, error_message: 'Se agotó el tiempo' });
    redesigns.history.mockResolvedValue([failed]);
    redesigns.retry.mockResolvedValue(redesign());
    renderPage('/redesign?project=p1');

    const error = await screen.findByText('No pudimos terminar tu rediseño');
    expect(within(error.parentElement as HTMLElement).getByText('Se agotó el tiempo')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

    expect(redesigns.retry).toHaveBeenCalledWith('r1');
    expect(await screen.findByAltText('Propuesta de la IA')).toBeTruthy();
  });

  it('creates a new version with another style from the same photo', async () => {
    redesigns.history.mockResolvedValue([redesign({ style: { slug: 'nordic', name: 'Nórdico' } })]);
    redesigns.variation.mockResolvedValue(redesign({ id: 'r2' }));
    renderPage('/redesign?project=p1');

    await userEvent.click(await screen.findByRole('button', { name: /Probar con otras opciones/ }));
    const form = screen.getByRole('heading', { name: 'Prueba otra versión' }).closest('form') as HTMLFormElement;
    await userEvent.click(within(form).getByRole('button', { name: 'Ambiente de estilo Industrial Industrial' }));
    await userEvent.click(within(form).getByRole('button', { name: /Generar nueva versión/ }));

    expect(redesigns.variation).toHaveBeenCalledWith('r1', expect.objectContaining({ style: 'industrial' }));
  });
});
