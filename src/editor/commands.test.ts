import { describe, expect, it } from 'vitest';
import type { SceneData, SceneItemData } from '../types/project';
import {
  AddNodesCommand,
  CommandHistory,
  GroupNodesCommand,
  MoveNodeCommand,
  RemoveNodeCommand,
  RotateNodeCommand,
  UngroupCommand,
  UpdateItemCommand,
} from './commands';

const item = (id: string, x = 0, z = 0): SceneItemData => ({
  kind: 'item',
  id,
  furniture_id: 1,
  name: id,
  category: 'sofa',
  shape: 'sofa',
  position: [x, z],
  rotation: 0,
  size: [2, 1, 0.8],
  color: '#aaaaaa',
  price: 100,
  finish: null,
  addons: [],
});

const scene = (nodes = [item('a'), item('b', 1, 1)]): SceneData => ({
  format: 1,
  style: 'nordic',
  room: { width: 5, length: 4, height: 2.7, wall_material: null, floor_material: null },
  lighting: { color: '#ffffff', intensity: 1 },
  nodes,
});

describe('CommandHistory', () => {
  it('undoes and redoes a move', () => {
    const history = new CommandHistory(10);
    const start = scene();
    const moved = history.execute(new MoveNodeCommand('a', 0.5, -0.25), start);
    expect(moved.nodes[0]).toMatchObject({ position: [0.5, -0.25] });
    const undone = history.undo(moved);
    expect(undone.nodes[0]).toMatchObject({ position: [0, 0] });
    expect(history.redo(undone).nodes[0]).toMatchObject({ position: [0.5, -0.25] });
  });

  it('clears the redo stack after a new command', () => {
    const history = new CommandHistory(10);
    let current = history.execute(new RotateNodeCommand('a', 90), scene());
    current = history.undo(current);
    expect(history.canRedo).toBe(true);
    history.execute(new AddNodesCommand([item('c')]), current);
    expect(history.canRedo).toBe(false);
    expect(history.undoLabel).toBe('Agregar mueble');
  });

  it('keeps only the configured number of steps', () => {
    const history = new CommandHistory(2);
    let current = scene();
    for (let i = 0; i < 3; i++) current = history.execute(new MoveNodeCommand('a', 1, 0), current);
    current = history.undo(history.undo(current));
    expect(history.canUndo).toBe(false);
    expect(current.nodes[0]).toMatchObject({ position: [1, 0] });
  });

  it('restores a removed node in its original place', () => {
    const history = new CommandHistory(10);
    const removed = history.execute(new RemoveNodeCommand('a'), scene());
    expect(removed.nodes.map((n) => n.id)).toEqual(['b']);
    expect(history.undo(removed).nodes.map((n) => n.id)).toEqual(['a', 'b']);
  });

  it('reverts item changes such as add-ons', () => {
    const history = new CommandHistory(10);
    const changed = history.execute(new UpdateItemCommand('a', { addons: ['cushions'], color: '#000000' }), scene());
    expect(changed.nodes[0]).toMatchObject({ addons: ['cushions'], color: '#000000' });
    expect(history.undo(changed).nodes[0]).toMatchObject({ addons: [], color: '#aaaaaa' });
  });

  it('groups and ungroups nodes as a composite', () => {
    const history = new CommandHistory(10);
    const grouped = history.execute(new GroupNodesCommand(['a', 'b'], { id: 'g', name: 'Zona' }), scene());
    expect(grouped.nodes).toHaveLength(1);
    const moved = history.execute(new MoveNodeCommand('g', 1, 0), grouped);
    const group = moved.nodes[0];
    expect(group.kind === 'group' && group.children.map((c) => c.kind === 'item' && c.position[0])).toEqual([1, 2]);
    const ungrouped = history.execute(new UngroupCommand('g'), moved);
    expect(ungrouped.nodes.map((n) => n.id)).toEqual(['a', 'b']);
    expect(history.undo(ungrouped).nodes[0].id).toBe('g');
  });

  it('ignores commands that change nothing', () => {
    const history = new CommandHistory(10);
    const start = scene();
    expect(history.execute(new GroupNodesCommand(['a'], { id: 'g', name: 'x' }), start)).toBe(start);
    expect(history.canUndo).toBe(false);
  });
});
