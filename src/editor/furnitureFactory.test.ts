import { describe, expect, it } from 'vitest';
import type { FurnitureItem } from '../types/catalog';
import { BoxFactory, furnitureFactoryFor, SofaFactory, TableFactory } from './furnitureFactory';

const catalogItem = (shape: string): FurnitureItem => ({
  id: 7,
  name: 'Pieza',
  description: '',
  price: '1500000',
  width: 2,
  depth: 0.9,
  height: 0.8,
  default_color: '#d8c8ae',
  model_url: null,
  category: { id: 1, slug: shape, name: shape, icon: 'box', shape, room_types: [] },
});

describe('furniture factory method', () => {
  it('picks the factory that matches the catalog shape', () => {
    expect(furnitureFactoryFor('sofa')).toBeInstanceOf(SofaFactory);
    expect(furnitureFactoryFor('table')).toBeInstanceOf(TableFactory);
    expect(furnitureFactoryFor('spaceship')).toBeInstanceOf(BoxFactory);
  });

  it('creates a scene item from catalog data', () => {
    const item = furnitureFactoryFor('sofa').createItem(catalogItem('sofa'), [1, -1]);
    expect(item).toMatchObject({ kind: 'item', furniture_id: 7, size: [2, 0.9, 0.8], price: 1500000, position: [1, -1] });
    expect(item.id).toMatch(/^n-/);
  });

  it.each(['sofa', 'chair', 'bed', 'table', 'desk', 'cabinet', 'shelf', 'lamp', 'rug', 'plant'])(
    'builds a %s model that stays inside its footprint',
    (shape) => {
      const parts = furnitureFactoryFor(shape).createModel([1.2, 0.8, 1], '#c19a5b');
      expect(parts.length).toBeGreaterThan(0);
      for (const part of parts) {
        expect(Math.abs(part.position[0])).toBeLessThanOrEqual(0.6 + 1e-6);
        expect(Math.abs(part.position[2])).toBeLessThanOrEqual(0.4 + 1e-6);
        expect(part.position[1]).toBeLessThanOrEqual(1.2);
      }
    },
  );

  it('applies the chosen finish only to the main surfaces', () => {
    const parts = new SofaFactory().createModel([2, 0.9, 0.8], '#d8c8ae', { roughness: 0.2, metalness: 0.6 });
    expect(parts.find((p) => p.role === 'seat')).toMatchObject({ roughness: 0.2, metalness: 0.6 });
    expect(parts.find((p) => p.role === 'leg')?.metalness).toBeUndefined();
  });
});
