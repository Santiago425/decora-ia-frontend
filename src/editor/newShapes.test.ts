import { describe, expect, it, vi } from 'vitest';
import type { FurnitureItem } from '../types/catalog';
import type { SceneData, Size3 } from '../types/project';
import { EditorMediator } from './editorMediator';
import { EditorStore } from './editorStore';
import { buildPricing } from './furnitureDecorators';
import { BoxFactory, furnitureFactoryFor, type Part } from './furnitureFactory';

const SHAPES: [string, Size3][] = [
  ['pouf', [0.5, 0.5, 0.4]],
  ['pouf', [1.3, 0.42, 0.45]],
  ['side_table', [0.45, 0.45, 0.55]],
  ['stool', [0.4, 0.4, 0.75]],
  ['art', [1.5, 0.03, 0.6]],
  ['curtain', [1.6, 0.12, 2.4]],
  ['tv', [1.23, 0.06, 0.71]],
  ['vase', [0.35, 0.35, 1.2]],
  ['basket', [0.45, 0.45, 0.5]],
  ['towel_rack', [0.5, 0.25, 0.9]],
  ['appliance', [0.6, 0.6, 0.85]],
];

const bottom = (part: Part) => part.position[1] - (part.geometry === 'sphere' ? part.size[0] : part.size[1] / 2);
const top = (part: Part) => part.position[1] + (part.geometry === 'sphere' ? part.size[0] : part.size[1] / 2);

describe('factories for the new catalog shapes', () => {
  it.each(SHAPES)('builds a real model for %s', (shape, size) => {
    const factory = furnitureFactoryFor(shape);
    expect(factory).not.toBeInstanceOf(BoxFactory);
    const parts = factory.createModel(size, '#c4704f');
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(bottom(part)).toBeGreaterThanOrEqual(-0.001);
      expect(Math.abs(part.position[0])).toBeLessThanOrEqual(size[0] / 2 + 0.07);
    }
  });

  it('hangs art and TVs on the wall instead of standing them on the floor', () => {
    for (const shape of ['art', 'tv']) {
      const parts = furnitureFactoryFor(shape).createModel([1, 0.04, 0.6], '#4f6d8a');
      expect(Math.min(...parts.map(bottom))).toBeGreaterThan(0.8);
    }
  });

  it('lets a curtain fall from its rod to the floor', () => {
    const parts = furnitureFactoryFor('curtain').createModel([1.6, 0.12, 2.4], '#efe6d6');
    expect(Math.max(...parts.map(top))).toBeCloseTo(2.4, 1);
    expect(Math.min(...parts.map(bottom))).toBeCloseTo(0, 2);
  });
});

const painting: FurnitureItem = {
  id: 9,
  name: 'Cuadro',
  description: '',
  price: '390000',
  width: 0.8,
  depth: 0.04,
  height: 1,
  default_color: '#c4704f',
  model_url: null,
  category: { id: 2, slug: 'art', name: 'Arte', icon: 'image', shape: 'art', room_types: [], blocks_floor: false },
};

describe('wall pieces in the mediator', () => {
  it('hangs a new painting on a wall and never stacks two on the same spot', () => {
    const scene: SceneData = {
      format: 1,
      style: null,
      room: { width: 5, length: 4, height: 2.6, wall_material: null, floor_material: null },
      lighting: { color: '#fff4e0', intensity: 1 },
      nodes: [],
    };
    const store = new EditorStore(scene, { historyLimit: 20, readOnly: false });
    const mediator = new EditorMediator(store, {
      catalog: { furniture: [painting], materials: [], styles: [] },
      pricing: buildPricing([], []),
      moveStep: 0.1,
      rotateStep: 15,
      showPanel: vi.fn(),
      notify: vi.fn(),
      isCompact: () => false,
      openShortcuts: vi.fn(),
      toggleGuides: vi.fn(),
    });
    mediator.addFurniture(painting);
    mediator.addFurniture(painting);
    const [first, second] = store.getState().scene.nodes;
    expect(first.kind === 'item' && first.position).toEqual([0, -1.98]);
    expect(second.kind === 'item' && second.position).not.toEqual(first.kind === 'item' && first.position);
  });
});
