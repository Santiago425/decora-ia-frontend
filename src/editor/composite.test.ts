import { describe, expect, it } from 'vitest';
import type { FurnitureAddon, Material } from '../types/catalog';
import type { SceneData, SceneItemData } from '../types/project';
import { FurnitureGroup, RoomComposite } from './composite';
import { buildPricing, decorateFurniture } from './furnitureDecorators';
import { themeFactoryFor } from './styleTheme';

const addon = (slug: string, visual: FurnitureAddon['visual'], price: number): FurnitureAddon => ({
  id: 1, slug, name: slug, description: '', price: String(price), visual, color_hex: '#ffffff', categories: ['sofa'],
});
const material = (slug: string, surface: Material['surface'], price: number): Material => ({
  id: 1, slug, name: slug, surface, color_hex: '#eeeeee', roughness: 0.9, metalness: 0, price_per_unit: String(price),
});
const item = (id: string, price: number, addons: string[] = []): SceneItemData => ({
  kind: 'item', id, furniture_id: 1, name: id, category: 'sofa', shape: 'sofa', position: [0, 0], rotation: 0,
  size: [2, 0.9, 0.8], color: '#aaaaaa', price, finish: null, addons,
});

const pricing = buildPricing(
  [addon('cushions', 'cushions', 50), addon('guard', 'none', 30)],
  [material('paint', 'wall', 10), material('oak', 'floor', 100)],
);

describe('decorated furniture', () => {
  it('adds the price and the visual parts of each add-on', () => {
    const plain = decorateFurniture(item('a', 1000), pricing);
    const decorated = decorateFurniture(item('a', 1000, ['cushions', 'guard']), pricing);
    expect(decorated.price()).toBe(1080);
    expect(decorated.labels()).toEqual(['a', 'cushions', 'guard']);
    expect(decorated.parts().length).toBeGreaterThan(plain.parts().length);
  });
});

describe('scene composite', () => {
  const scene: SceneData = {
    format: 1,
    style: null,
    room: { width: 2, length: 3, height: 2, wall_material: 'paint', floor_material: 'oak' },
    lighting: { color: '#ffffff', intensity: 1 },
    nodes: [item('a', 1000, ['cushions']), { kind: 'group', id: 'g', name: 'Zona', children: [item('b', 200), item('c', 300)] }],
  };

  it('prices items, groups and surfaces the same way', () => {
    const room = new RoomComposite(scene, pricing);
    expect(room.find('g')?.price()).toBe(500);
    expect(room.furniturePrice()).toBe(1550);
    expect(room.surfaces()).toMatchObject({ floor: 600, walls: 200 });
    expect(room.price()).toBe(2350);
    expect(room.itemCount()).toBe(3);
  });

  it('clones a group with new ids (prototype)', () => {
    const group = new RoomComposite(scene, pricing).find('g') as FurnitureGroup;
    const copy = group.clone();
    expect(copy.id).not.toBe('g');
    expect(copy.children.map((c) => c.id)).not.toContain('b');
    expect(copy.children).toHaveLength(2);
  });
});

describe('style theme abstract factory', () => {
  it('produces a matching lighting and surfaces family for a style', () => {
    const catalog = [material('paint', 'wall', 10), material('oak', 'floor', 100)];
    const style = {
      id: 1, slug: 'nordic', name: 'Nórdico', description: '', image_url: null, lighting_color: '#fff6e8',
      lighting_intensity: 1.2, palettes: [{ id: 1, name: 'p', colors: ['#111111'] }], materials: [material('oak', 'floor', 100)],
    };
    const theme = themeFactoryFor(style, catalog);
    expect(theme.createLighting()).toEqual({ color: '#fff6e8', intensity: 1.2 });
    expect(theme.createFloorFinish().slug).toBe('oak');
    expect(theme.createWallFinish().slug).toBe('paint');
    expect(themeFactoryFor(undefined, catalog).slug).toBeNull();
  });
});
