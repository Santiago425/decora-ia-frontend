// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FurnitureCategory, FurnitureItem, Material, RoomType } from '../../types/catalog';
import { CatalogPanel } from './CatalogPanel';

const service = vi.hoisted(() => ({ favorites: vi.fn(), setFavorite: vi.fn() }));
vi.mock('../../services/catalogService', () => ({ catalogService: service }));

const sofas: FurnitureCategory = {
  id: 1,
  slug: 'sofa',
  name: 'Sofás',
  icon: 'sofa',
  shape: 'sofa',
  room_types: ['living_room'],
};
const lamps: FurnitureCategory = {
  id: 2,
  slug: 'lamp',
  name: 'Lámparas',
  icon: 'lamp',
  shape: 'lamp',
  room_types: ['living_room', 'bedroom'],
};

const piece = (id: number, name: string, price: number, category: FurnitureCategory): FurnitureItem => ({
  id,
  name,
  description: 'Una pieza de prueba.',
  price: String(price),
  width: 1,
  depth: 0.5,
  height: 0.8,
  default_color: '#d8c8ae',
  model_url: null,
  materials: 'Lino y roble',
  color_options: [
    { name: 'Lino arena', hex: '#d8c8ae' },
    { name: 'Terracota', hex: '#c4704f' },
  ],
  finish_options: ['velvet_forest'],
  category,
});

const furniture = [
  piece(1, 'Sofá Oslo', 2890000, sofas),
  piece(2, 'Lámpara Arco', 790000, lamps),
  piece(3, 'Sofá Nube', 3990000, sofas),
];
const rooms: RoomType[] = [
  { id: 1, slug: 'living_room', name: 'Sala', icon: 'sofa' },
  { id: 2, slug: 'bedroom', name: 'Dormitorio', icon: 'bed' },
];
const velvet = {
  id: 9,
  slug: 'velvet_forest',
  name: 'Terciopelo verde',
  surface: 'furniture',
  color_hex: '#3f5a46',
  roughness: 0.9,
  metalness: 0,
  price_per_unit: '0',
} as Material;

function setup(onAdd = vi.fn()) {
  render(
    <CatalogPanel
      categories={[sofas, lamps]}
      furniture={furniture}
      roomTypes={rooms}
      finishes={[velvet]}
      roomType={null}
      roomName={null}
      disabled={false}
      onAdd={onAdd}
    />,
  );
  return onAdd;
}

const names = () =>
  within(screen.getByRole('list'))
    .queryAllByTitle(/^Ver /)
    .map((button) => button.title.slice(4));

describe('catalog panel', () => {
  beforeEach(() => {
    service.favorites.mockResolvedValue([3]);
    service.setFavorite.mockResolvedValue(null);
  });

  it('sorts by price and filters by room and price', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Ordenar y filtrar' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar' }), 'price-asc');
    expect(names()).toEqual(['Lámpara Arco', 'Sofá Oslo', 'Sofá Nube']);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Habitación' }), 'bedroom');
    expect(names()).toHaveLength(1);
    expect(screen.getByText('1 pieza')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Quitar filtros' }));
    expect(names()).toHaveLength(3);
  });

  it('keeps favorites from the server and saves a new one', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(await screen.findByRole('tab', { name: /Favoritos \(1\)/ }));
    expect(names()).toEqual(['Sofá Nube']);

    await user.click(screen.getByRole('tab', { name: 'Todos' }));
    await user.click(screen.getByRole('button', { name: 'Guardar Sofá Oslo en favoritos' }));
    expect(service.setFavorite).toHaveBeenCalledWith(1, true);
    expect(screen.getByRole('tab', { name: /Favoritos \(2\)/ })).toBeTruthy();
  });

  it('hides favorites when the server does not offer them', async () => {
    service.favorites.mockRejectedValue(new Error('404'));
    setup();
    await waitFor(() => expect(service.favorites).toHaveBeenCalled());
    expect(screen.queryByRole('tab', { name: /Favoritos/ })).toBeNull();
  });

  it('opens the detail sheet and adds the chosen finish', async () => {
    const user = userEvent.setup();
    const onAdd = setup();
    await user.click(screen.getByTitle('Ver Sofá Oslo'));
    const sheet = screen.getByRole('dialog');
    expect(within(sheet).getByText('Lino y roble')).toBeTruthy();
    expect(within(sheet).getByText('Sala')).toBeTruthy();

    await user.click(within(sheet).getByRole('button', { name: 'Color Terracota' }));
    await user.click(within(sheet).getByRole('button', { name: /Terciopelo verde/ }));
    await user.click(within(sheet).getByRole('button', { name: /Agregar al diseño/ }));
    expect(onAdd).toHaveBeenCalledWith(furniture[0], { color: '#3f5a46', finish: 'velvet_forest' });
  });

  it('goes back to the list from the detail sheet with the back button, the X or the backdrop', async () => {
    const user = userEvent.setup();
    setup();
    const title = () => screen.queryByRole('heading', { name: 'Sofá Oslo' });

    await user.click(screen.getByTitle('Ver Sofá Oslo'));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Regresar/ }));
    expect(title()).toBeNull();

    await user.click(screen.getByTitle('Ver Sofá Oslo'));
    await user.click(screen.getByRole('button', { name: 'Cerrar y volver al catálogo' }));
    expect(title()).toBeNull();

    await user.click(screen.getByTitle('Ver Sofá Oslo'));
    await user.click(screen.getByRole('dialog'));
    expect(title()).toBeNull();
  });

  it('adds a piece in its default color from the plus button', async () => {
    const user = userEvent.setup();
    const onAdd = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Lámpara Arco' }));
    expect(onAdd).toHaveBeenCalledWith(furniture[1]);
  });
});
