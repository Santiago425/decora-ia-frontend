import type { ActionOutcome } from '../assistant/assistantBus';
import type { AssistantAction } from '../types/assistant';
import type { DesignStyle, FurnitureItem, Material } from '../types/catalog';
import type { LightingData, RoomData } from '../types/project';
import {
  AddNodesCommand,
  GroupNodesCommand,
  MountOnWallCommand,
  MoveNodeCommand,
  RemoveNodeCommand,
  RenameNodeCommand,
  ResizeItemCommand,
  RotateNodeCommand,
  UngroupCommand,
  UpdateItemCommand,
  UpdateSceneCommand,
  type ItemPatch,
} from './commands';
import { RoomComposite } from './composite';
import { wallSnapOffset } from './layoutGuides';
import type { EditorStore } from './editorStore';
import type { Pricing } from './furnitureDecorators';
import { furnitureFactoryFor } from './furnitureFactory';
import { findFreeSpot, findNode, newNodeId, nodeBounds, topLevelIdOf } from './sceneTree';
import { themeFactoryFor } from './styleTheme';
import { findWallSpot, isWallOpening, isWallOpeningShape, remountOpenings, wallMount } from './wallOpenings';

export type EditorPanel = 'catalog' | 'settings' | 'versions';
export type NoticeKind = 'info' | 'success' | 'error';

export interface EditorKey {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface EditorMediatorOptions {
  catalog: { furniture: FurnitureItem[]; materials: Material[]; styles: DesignStyle[] };
  pricing: Pricing;
  moveStep: number;
  rotateStep: number;
  /** Panels and toasts are UI concerns: the page plugs them in so the mediator stays framework-free. */
  showPanel: (panel: EditorPanel) => void;
  notify: (message: string, kind: NoticeKind) => void;
  isCompact: () => boolean;
  openShortcuts?: () => void;
  toggleGuides?: () => void;
}

export interface Shortcut {
  keys: string[];
  label: string;
}

export const SHORTCUTS: Shortcut[] = [
  { keys: ['Ctrl', 'Z'], label: 'Deshacer' },
  { keys: ['Ctrl', 'Shift', 'Z'], label: 'Rehacer (también Ctrl + Y)' },
  { keys: ['Ctrl', 'D'], label: 'Duplicar lo seleccionado' },
  { keys: ['Supr'], label: 'Eliminar lo seleccionado' },
  { keys: ['R'], label: 'Girar (Shift + R gira al otro lado)' },
  { keys: ['←', '↑', '→', '↓'], label: 'Mover lo seleccionado' },
  { keys: ['P'], label: 'Pegar lo seleccionado a la pared más cercana' },
  { keys: ['Shift', 'Clic'], label: 'Seleccionar varios muebles' },
  { keys: ['M'], label: 'Mostrar u ocultar las medidas' },
  { keys: ['Esc'], label: 'Quitar la selección' },
  { keys: ['?'], label: 'Mostrar esta ayuda' },
];

const NEEDS_SELECTION = new Set(['rotate_selected', 'remove_selected', 'duplicate_selected']);

// Mediator: the canvas, the side panels, the keyboard and Lumi never talk to each other.
// Each one reports what happened here and the mediator decides which command runs and which panel opens.
export class EditorMediator {
  constructor(
    private readonly store: EditorStore,
    private readonly options: EditorMediatorOptions,
  ) {}

  addFurniture(item: FurnitureItem): void {
    const scene = this.store.getState().scene;
    const factory = furnitureFactoryFor(item.category.shape);
    let node = factory.createItem(item, findFreeSpot(scene, [item.width, item.depth]));
    if (isWallOpeningShape(item.category.shape))
      node = { ...node, ...findWallSpot(scene, node.size, item.category.shape) };
    // Art, curtains and TVs hang on a wall like a window does, but stay free to move afterwards.
    else if (item.category.blocks_floor === false) {
      const sameKind = (other: { category: string }) => other.category === item.category.slug;
      node = { ...node, ...findWallSpot(scene, node.size, 'window', sameKind) };
    }
    if (this.store.execute(new AddNodesCommand([node], `Agregar ${item.name}`))) this.store.select([node.id]);
  }

  duplicate(id: string): void {
    const component = new RoomComposite(this.store.getState().scene, this.options.pricing).find(id);
    if (!component) return;
    const copy = component.clone();
    if (this.store.execute(new AddNodesCommand([copy], 'Duplicar'))) this.store.select([copy.id]);
  }

  remove(id: string): void {
    this.store.execute(new RemoveNodeCommand(id));
  }

  rotate(id: string, degrees: number): void {
    if (isWallOpening(findNode(this.store.getState().scene.nodes, id))) {
      this.options.notify('Las puertas y ventanas siempre miran hacia el cuarto. Arrástralas a otra pared', 'info');
      return;
    }
    this.store.execute(new RotateNodeCommand(id, degrees));
  }

  move(id: string, dx: number, dz: number): void {
    const { scene } = this.store.getState();
    const node = findNode(scene.nodes, id);
    if (isWallOpening(node)) {
      const [x, z] = node.position;
      this.store.execute(new MountOnWallCommand(id, wallMount([x + dx, z + dz], node.size, scene.room)));
      return;
    }
    this.store.execute(new MoveNodeCommand(id, dx, dz));
  }

  snapToWall(id: string): void {
    const { scene } = this.store.getState();
    const node = findNode(scene.nodes, id);
    if (!node) return;
    const [dx, dz] = wallSnapOffset(nodeBounds(node), scene.room);
    if (dx !== 0 || dz !== 0) this.move(id, dx, dz);
  }

  resize(id: string, size: [number, number, number]): void {
    this.store.execute(new ResizeItemCommand(id, size));
  }

  rename(id: string, name: string): void {
    this.store.execute(new RenameNodeCommand(id, name));
  }

  updateItem(id: string, changes: ItemPatch, label: string): void {
    this.store.execute(new UpdateItemCommand(id, changes, label));
  }

  group(ids: string[], name: string): void {
    const id = newNodeId('g');
    if (this.store.execute(new GroupNodesCommand(ids, { id, name }))) this.store.select([id]);
  }

  ungroup(id: string): void {
    this.store.execute(new UngroupCommand(id));
  }

  select(id: string | null, additive: boolean): void {
    if (!id) {
      if (!additive) this.store.select([]);
      return;
    }
    const { scene, selection } = this.store.getState();
    const top = topLevelIdOf(scene.nodes, id) ?? id;
    if (additive) this.store.toggleSelection(top);
    else if (!selection.includes(top) || selection.length > 1) this.store.select([top]);
    if (this.options.isCompact()) this.options.showPanel('settings');
  }

  applyStyle(slug: string): void {
    const { styles, materials } = this.options.catalog;
    const theme = themeFactoryFor(
      styles.find((s) => s.slug === slug),
      materials,
    );
    const room = this.store.getState().scene.room;
    this.store.execute(
      new UpdateSceneCommand(
        {
          style: slug,
          lighting: {
            ...theme.createLighting(),
            time_of_day: this.store.getState().scene.lighting.time_of_day ?? null,
          },
          room: {
            ...room,
            wall_material: theme.createWallFinish().slug,
            floor_material: theme.createFloorFinish().slug,
          },
        },
        'Cambiar estilo',
      ),
    );
  }

  setRoom(room: RoomData, label: string): void {
    const { scene } = this.store.getState();
    const resized = room.width !== scene.room.width || room.length !== scene.room.length;
    const patch = resized ? { room, nodes: remountOpenings(scene.nodes, room) } : { room };
    this.store.execute(new UpdateSceneCommand(patch, label));
  }

  setLighting(lighting: LightingData): void {
    this.store.execute(new UpdateSceneCommand({ lighting }, 'Cambiar luz'));
  }

  /** Returns true when the key was an editor shortcut, so the caller can prevent the browser default. */
  handleKey(event: EditorKey): boolean {
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const { selection } = this.store.getState();
    const [selected] = selection;
    const step = this.options.moveStep;
    const arrows: Record<string, [number, number]> = {
      arrowleft: [-step, 0],
      arrowright: [step, 0],
      arrowup: [0, -step],
      arrowdown: [0, step],
    };

    if (mod && key === 'z') this.store[event.shiftKey ? 'redo' : 'undo']();
    else if (mod && key === 'y') this.store.redo();
    else if (mod && key === 'd' && selected) this.duplicate(selected);
    else if ((key === 'delete' || key === 'backspace') && selected) selection.forEach((id) => this.remove(id));
    else if (key === 'r' && !mod && selected)
      this.rotate(selected, event.shiftKey ? -this.options.rotateStep : this.options.rotateStep);
    else if (key in arrows && selected) this.move(selected, ...arrows[key]);
    else if (key === 'p' && !mod && selected) this.snapToWall(selected);
    else if (key === 'escape') this.store.select([]);
    else if (key === '?' && this.options.openShortcuts) this.options.openShortcuts();
    else if (key === 'm' && !mod && this.options.toggleGuides) this.options.toggleGuides();
    else return false;
    return true;
  }

  /** Lumi's actions arrive here; the outcome tells the chat whether the scene really changed. */
  handleAssistant(action: AssistantAction): ActionOutcome {
    const { params } = action;
    const editor = this.store.getState();
    const selected = editor.selection;
    if (NEEDS_SELECTION.has(action.type) && selected.length === 0) {
      this.options.notify('Primero selecciona un mueble en la habitación', 'info');
      return 'blocked';
    }
    if (editor.readOnly && action.type !== 'undo' && action.type !== 'redo') {
      this.options.notify('Este proyecto está terminado. Reábrelo para seguir editando', 'info');
      return 'blocked';
    }
    switch (action.type) {
      case 'add_furniture': {
        const item = this.options.catalog.furniture.find((f) => f.id === Number(params.furniture_id));
        if (!item) return 'blocked';
        this.addFurniture(item);
        return 'done';
      }
      case 'change_style':
        this.applyStyle(String(params.style));
        return 'done';
      case 'change_wall':
      case 'change_floor': {
        const key = action.type === 'change_wall' ? 'wall_material' : 'floor_material';
        const label = action.type === 'change_wall' ? 'Cambiar paredes' : 'Cambiar piso';
        this.setRoom({ ...editor.scene.room, [key]: String(params.material) }, label);
        return 'done';
      }
      case 'set_lighting': {
        const { lighting } = editor.scene;
        const intensity = Math.min(2, Math.max(0.3, lighting.intensity + Number(params.delta) * 0.4));
        this.setLighting({ ...lighting, intensity: Number(intensity.toFixed(2)) });
        return 'done';
      }
      case 'undo':
        this.store.undo();
        return 'done';
      case 'redo':
        this.store.redo();
        return 'done';
      case 'rotate_selected':
        selected.forEach((id) => this.rotate(id, Number(params.degrees) || this.options.rotateStep));
        return 'done';
      case 'remove_selected':
        selected.forEach((id) => this.remove(id));
        return 'done';
      case 'duplicate_selected':
        selected.forEach((id) => this.duplicate(id));
        return 'done';
      default:
        return 'ignored';
    }
  }
}
