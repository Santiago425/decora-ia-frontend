import { describe, expect, it } from 'vitest';
import type { AddonVisual, FurnitureAddon } from '../types/catalog';
import type { SceneItemData, Size3 } from '../types/project';
import { buildPricing, decorateFurniture } from './furnitureDecorators';

const addon = (visual: AddonVisual, price = '100000'): FurnitureAddon => ({
  id: 1,
  slug: visual,
  name: visual,
  description: '',
  price,
  visual,
  icon: 'sparkles',
  color_hex: '#a9b49a',
  categories: [],
});

const item = (shape: string, size: Size3, addons: string[]): SceneItemData => ({
  kind: 'item',
  id: 'i',
  furniture_id: 1,
  name: 'Pieza',
  category: shape,
  shape,
  position: [0, 0],
  rotation: 0,
  size,
  color: '#c8a27a',
  price: 500000,
  finish: null,
  addons,
});

const VISUALS: [AddonVisual, string, Size3][] = [
  ['books', 'shelf', [0.8, 0.35, 1.8]],
  ['vase', 'table', [1.9, 0.95, 0.76]],
  ['runner', 'table', [1.9, 0.95, 0.76]],
  ['lamp', 'cabinet', [0.5, 0.4, 0.55]],
  ['succulent', 'desk', [1.4, 0.7, 0.75]],
  ['towels', 'vanity', [0.8, 0.48, 0.85]],
  ['headboard', 'bed', [1.6, 2.1, 0.9]],
  ['duvet', 'bed', [1.6, 2.1, 0.9]],
  ['sheer', 'curtain', [1.6, 0.12, 2.4]],
  ['soundbar', 'tv', [1.23, 0.06, 0.71]],
];

describe('decorators for the new add-ons', () => {
  it.each(VISUALS)('%s adds visible parts to a %s and its price', (visual, shape, size) => {
    const pricing = buildPricing([addon(visual)], []);
    const plain = decorateFurniture(item(shape, size, []), pricing);
    const decorated = decorateFurniture(item(shape, size, [visual]), pricing);
    expect(decorated.parts().length).toBeGreaterThan(plain.parts().length);
    expect(decorated.price()).toBe(plain.price() + 100000);
    expect(decorated.labels()).toContain(visual);
  });

  it('stands small objects on top of the furniture, not inside it', () => {
    const pricing = buildPricing([addon('vase')], []);
    const table = item('table', [1.9, 0.95, 0.76], ['vase']);
    const [vase] = decorateFurniture(table, pricing)
      .parts()
      .filter((part) => part.role === 'decor');
    expect(vase.position[1] - vase.size[1] / 2).toBeGreaterThanOrEqual(0.76 - 0.001);
  });

  it('turns an art frame gold without touching the canvas', () => {
    const pricing = buildPricing([addon('frame')], []);
    const parts = decorateFurniture(item('art', [0.8, 0.04, 1], ['frame']), pricing).parts();
    expect(parts.filter((part) => part.role === 'body').every((part) => part.color === '#a9b49a')).toBe(true);
    expect(parts.some((part) => part.role === 'top' && part.color !== '#a9b49a')).toBe(true);
  });
});
