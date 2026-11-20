import { describe, expect, it, vi } from 'vitest';
import type { FurnitureItem } from '../types/catalog';
import type { SceneData } from '../types/project';
import { EditorMediator, type EditorKey } from './editorMediator';
import { EditorStore } from './editorStore';
import { buildPricing } from './furnitureDecorators';

const sofa: FurnitureItem = {
  id: 7,
  name: 'Sofá',
  description: '',
  price: '1500000',
  width: 2,
  depth: 0.9,
  height: 0.8,
  default_color: '#d8c8ae',
  model_url: null,
  category: { id: 1, slug: 'sofas', name: 'Sofás', icon: 'sofa', shape: 'sofa', room_types: [] },
};

const emptyScene = (): SceneData => ({
  format: 1,
  style: null,
  room: { width: 5, length: 4, height: 2.6, wall_material: null, floor_material: null },
  lighting: { color: '#fff4e0', intensity: 1 },
  nodes: [],
});

const key = (value: string, extra: Partial<EditorKey> = {}): EditorKey => ({
  key: value,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...extra,
});

function setup({ compact = false, readOnly = false } = {}) {
  const store = new EditorStore(emptyScene(), { historyLimit: 20, readOnly });
  const showPanel = vi.fn();
  const notify = vi.fn();
  const openShortcuts = vi.fn();
  const toggleGuides = vi.fn();
  const mediator = new EditorMediator(store, {
    catalog: { furniture: [sofa], materials: [], styles: [] },
    pricing: buildPricing([], []),
    moveStep: 0.1,
    rotateStep: 15,
    showPanel,
    notify,
    isCompact: () => compact,
    openShortcuts,
    toggleGuides,
  });
  return { store, mediator, showPanel, notify, openShortcuts, toggleGuides };
}

describe('editor mediator', () => {
  it('toggles the measure guides with M', () => {
    const { mediator, toggleGuides } = setup();
    expect(mediator.handleKey(key('m'))).toBe(true);
    expect(mediator.handleKey(key('m', { ctrlKey: true }))).toBe(false);
    expect(toggleGuides).toHaveBeenCalledTimes(1);
  });

  it('adds furniture and selects it', () => {
    const { store, mediator } = setup();
    mediator.addFurniture(sofa);
    const { scene, selection } = store.getState();
    expect(scene.nodes).toHaveLength(1);
    expect(selection).toEqual([scene.nodes[0].id]);
  });

  it('opens the settings panel on small screens when something is selected', () => {
    const { store, mediator, showPanel } = setup({ compact: true });
    mediator.addFurniture(sofa);
    mediator.select(store.getState().scene.nodes[0].id, false);
    expect(showPanel).toHaveBeenCalledWith('settings');
  });

  it('keeps the panel on wide screens', () => {
    const { store, mediator, showPanel } = setup();
    mediator.addFurniture(sofa);
    mediator.select(store.getState().scene.nodes[0].id, false);
    expect(showPanel).not.toHaveBeenCalled();
  });

  it('turns keyboard shortcuts into commands', () => {
    const { store, mediator, openShortcuts } = setup();
    mediator.addFurniture(sofa);
    const itemX = () => {
      const [node] = store.getState().scene.nodes;
      return node.kind === 'item' ? node.position[0] : NaN;
    };
    const startX = itemX();

    expect(mediator.handleKey(key('ArrowRight'))).toBe(true);
    expect(itemX()).toBeCloseTo(startX + 0.1);

    expect(mediator.handleKey(key('d', { ctrlKey: true }))).toBe(true);
    expect(store.getState().scene.nodes).toHaveLength(2);

    expect(mediator.handleKey(key('z', { ctrlKey: true }))).toBe(true);
    expect(store.getState().scene.nodes).toHaveLength(1);

    expect(mediator.handleKey(key('?'))).toBe(true);
    expect(openShortcuts).toHaveBeenCalled();

    expect(mediator.handleKey(key('x'))).toBe(false);
  });

  it('handles Lumi actions and asks for a selection when needed', () => {
    const { store, mediator, notify } = setup();
    expect(mediator.handleAssistant({ type: 'rotate_selected', params: { degrees: 90 } })).toBe('blocked');
    expect(notify).toHaveBeenCalledWith('Primero selecciona un mueble en la habitación', 'info');

    expect(mediator.handleAssistant({ type: 'add_furniture', params: { furniture_id: 7 } })).toBe('done');
    expect(store.getState().scene.nodes).toHaveLength(1);

    expect(mediator.handleAssistant({ type: 'set_lighting', params: { delta: 1 } })).toBe('done');
    expect(store.getState().scene.lighting.intensity).toBeCloseTo(1.4);
  });

  it('refuses edits on a finished project', () => {
    const { store, mediator, notify } = setup({ readOnly: true });
    expect(mediator.handleAssistant({ type: 'add_furniture', params: { furniture_id: 7 } })).toBe('blocked');
    expect(store.getState().scene.nodes).toHaveLength(0);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('terminado'), 'info');
  });
});
