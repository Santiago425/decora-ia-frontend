import { describe, expect, it } from 'vitest';
import type { FurnitureItem } from '../types/catalog';
import {
  BoxFactory,
  CabinetFactory,
  furnitureFactoryFor,
  MirrorFactory,
  SofaFactory,
  TableFactory,
  ToiletFactory,
  TvStandFactory,
  VanityFactory,
  WardrobeFactory,
} from './furnitureFactory';

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
    expect(item).toMatchObject({
      kind: 'item',
      furniture_id: 7,
      size: [2, 0.9, 0.8],
      price: 1500000,
      position: [1, -1],
    });
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

  it('has a dedicated factory for every bathroom, kitchen and bedroom fixture', () => {
    expect(furnitureFactoryFor('toilet')).toBeInstanceOf(ToiletFactory);
    expect(furnitureFactoryFor('mirror')).toBeInstanceOf(MirrorFactory);
    expect(furnitureFactoryFor('wardrobe')).toBeInstanceOf(CabinetFactory);
    expect(furnitureFactoryFor('tv_stand')).toBeInstanceOf(TvStandFactory);
    for (const shape of ['vanity', 'bathtub', 'shower', 'fridge', 'stove', 'counter']) {
      expect(furnitureFactoryFor(shape)).not.toBeInstanceOf(BoxFactory);
    }
  });

  it.each(['toilet', 'vanity', 'bathtub', 'shower', 'mirror', 'fridge', 'stove', 'counter', 'wardrobe', 'tv_stand'])(
    'builds a %s model inside its floor footprint',
    (shape) => {
      const parts = furnitureFactoryFor(shape).createModel([1.2, 0.6, 0.9], '#c9ccce');
      expect(parts.length).toBeGreaterThan(1);
      for (const part of parts) {
        expect(Math.abs(part.position[0])).toBeLessThanOrEqual(0.6 + 1e-6);
        expect(Math.abs(part.position[2])).toBeLessThanOrEqual(0.3 + 1e-6);
        expect(part.position[1]).toBeGreaterThanOrEqual(0);
      }
    },
  );

  it('puts two basins on a wide vanity and one on a narrow one', () => {
    const basins = (width: number) =>
      new VanityFactory()
        .createModel([width, 0.5, 0.85], '#f5f4f0')
        .filter((p) => p.geometry === 'cylinder' && !p.metalness).length;
    expect(basins(1.3)).toBe(2);
    expect(basins(0.8)).toBe(1);
  });

  it('hangs small mirrors on the wall and stands tall ones on the floor', () => {
    const lowest = (height: number) =>
      Math.min(
        ...new MirrorFactory().createModel([0.6, 0.04, height], '#232323').map((p) => p.position[1] - p.size[1] / 2),
      );
    expect(lowest(0.9)).toBeGreaterThan(0.9);
    expect(lowest(1.6)).toBeLessThan(0.1);
  });

  it('adds handles to wardrobes and a screen above tv stands', () => {
    const cabinet = new CabinetFactory().createModel([1.2, 0.6, 2.1], '#f5f4f0');
    expect(new WardrobeFactory().createModel([1.2, 0.6, 2.1], '#f5f4f0').length).toBeGreaterThan(cabinet.length);
    const tv = new TvStandFactory().createModel([1.8, 0.45, 0.5], '#c8a27a');
    expect(Math.max(...tv.map((p) => p.position[1]))).toBeGreaterThan(0.5);
  });

  it('leaves glass and chrome out of the chosen finish', () => {
    const parts = furnitureFactoryFor('shower').createModel([0.9, 0.9, 2], '#dbe6e8', { roughness: 0.9, metalness: 0 });
    expect(parts.filter((p) => p.opacity !== undefined).every((p) => p.roughness === 0.05)).toBe(true);
    expect(parts.filter((p) => p.metalness === 0.85).length).toBeGreaterThan(0);
  });
});
