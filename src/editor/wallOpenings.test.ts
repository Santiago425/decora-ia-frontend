import { describe, expect, it, vi } from 'vitest';
import type { FurnitureItem } from '../types/catalog';
import type { SceneData, SceneItemData } from '../types/project';
import { EditorMediator } from './editorMediator';
import { EditorStore } from './editorStore';
import { buildPricing } from './furnitureDecorators';
import { furnitureFactoryFor } from './furnitureFactory';
import { overlappingIds } from './layoutGuides';
import { findWallSpot, isWallOpening, remountOpenings, wallMount } from './wallOpenings';

const room = { width: 5, length: 4 };

const opening = (shape: 'door' | 'window', width = 0.9): FurnitureItem => ({
  id: shape === 'door' ? 40 : 41,
  name: shape === 'door' ? 'Puerta' : 'Ventana',
  description: '',
  price: '500000',
  width,
  depth: 0.1,
  height: shape === 'door' ? 2.1 : 1.2,
  default_color: '#c8a27a',
  model_url: null,
  category: { id: 30, slug: shape, name: shape, icon: shape, shape, room_types: [] },
});

const scene = (): SceneData => ({
  format: 1,
  style: null,
  room: { ...room, height: 2.7, wall_material: null, floor_material: null },
  lighting: { color: '#fff4e0', intensity: 1 },
  nodes: [],
});

function setup() {
  const store = new EditorStore(scene(), { historyLimit: 20, readOnly: false });
  const notify = vi.fn();
  const mediator = new EditorMediator(store, {
    catalog: { furniture: [], materials: [], styles: [] },
    pricing: buildPricing([], []),
    moveStep: 0.1,
    rotateStep: 15,
    showPanel: vi.fn(),
    notify,
    isCompact: () => false,
  });
  return { store, mediator, notify };
}

const only = (store: EditorStore) => store.getState().scene.nodes[0] as SceneItemData;

describe('wall openings', () => {
  it('mounts on the closest wall facing into the room', () => {
    expect(wallMount([1, -1.8], [0.9, 0.1, 2.1], room)).toEqual({ position: [1, -1.95], rotation: 0 });
    expect(wallMount([1, 1.9], [0.9, 0.1, 2.1], room)).toEqual({ position: [1, 1.95], rotation: 180 });
    expect(wallMount([-2.4, 0.5], [0.9, 0.1, 2.1], room)).toEqual({ position: [-2.45, 0.5], rotation: 90 });
    expect(wallMount([2.4, 0], [0.9, 0.1, 2.1], room)).toEqual({ position: [2.45, 0], rotation: -90 });
  });

  it('keeps the whole opening inside the wall', () => {
    expect(wallMount([2.2, -1.9], [1.2, 0.1, 1.2], room).position).toEqual([1.9, -1.95]);
  });

  it('looks for a spot that does not cover another opening', () => {
    const first = findWallSpot(scene(), [0.9, 0.1, 2.1]);
    const taken = { ...scene(), nodes: [{ ...furnitureFactoryFor('door').createItem(opening('door')), ...first }] };
    const second = findWallSpot(taken, [0.9, 0.1, 2.1]);
    expect(first).toEqual({ position: [0, -1.95], rotation: 0 });
    expect(second.position).not.toEqual(first.position);
    expect(second.rotation).toBe(0);
  });

  it('keeps a door clear of furniture but lets a window sit over it', () => {
    const sofa = {
      ...furnitureFactoryFor('sofa').createItem({
        ...opening('door', 2),
        category: { ...opening('door').category, shape: 'sofa' },
      }),
      size: [2, 0.9, 0.8] as [number, number, number],
      position: [0, -1.5] as [number, number],
    };
    const furnished = { ...scene(), nodes: [sofa] };
    expect(findWallSpot(furnished, [0.9, 0.1, 2.1], 'door').position).not.toEqual([0, -1.95]);
    expect(findWallSpot(furnished, [1.2, 0.12, 1.2], 'window').position).toEqual([0, -1.94]);
  });

  it('follows the walls when the room changes size', () => {
    const door = {
      ...furnitureFactoryFor('door').createItem(opening('door')),
      position: [0, -1.95] as [number, number],
    };
    const [moved] = remountOpenings([door], { width: 6, length: 3 });
    expect((moved as SceneItemData).position).toEqual([0, -1.45]);
  });

  it('builds a door and a window that sits above the floor', () => {
    const door = furnitureFactoryFor('door').createModel([0.9, 0.1, 2.1], '#c8a27a');
    const window = furnitureFactoryFor('window').createModel([1.2, 0.12, 1.2], '#ffffff');
    expect(door.some((part) => part.role === 'decor')).toBe(true);
    expect(window.some((part) => part.role === 'glass')).toBe(true);
    expect(Math.min(...window.map((part) => part.position[1] - part.size[1] / 2))).toBeGreaterThan(0.5);
  });
});

describe('editor mediator with openings', () => {
  it('adds a door straight onto a wall and slides it along when dragged', () => {
    const { store, mediator } = setup();
    mediator.addFurniture(opening('door'));
    expect(only(store)).toMatchObject({ position: [0, -1.95], rotation: 0 });

    mediator.move(only(store).id, 1, 1);
    expect(only(store)).toMatchObject({ position: [1, -1.95], rotation: 0 });

    mediator.move(only(store).id, 1.4, 1.5);
    expect(only(store)).toMatchObject({ rotation: -90 });
    store.undo();
    expect(only(store)).toMatchObject({ position: [1, -1.95], rotation: 0 });
  });

  it('does not rotate an opening out of its wall', () => {
    const { store, mediator, notify } = setup();
    mediator.addFurniture(opening('window', 1.2));
    mediator.rotate(only(store).id, 15);
    expect(only(store).rotation).toBe(0);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('pared'), 'info');
  });

  it('is recognised as an opening and windows can sit over furniture', () => {
    const { store, mediator } = setup();
    mediator.addFurniture(opening('window', 1.2));
    expect(isWallOpening(only(store))).toBe(true);
    expect(overlappingIds(store.getState().scene.nodes, 0.02).size).toBe(0);
  });
});
