import type { SceneData, SceneGroupData, SceneItemData, SceneNodeData } from '../types/project';
import { insertNode, removeNode, replaceNode, rotateNode, translateNode } from './sceneTree';

// Command: every change to the scene is an object that knows how to apply and revert itself.
export interface Command {
  readonly label: string;
  execute(scene: SceneData): SceneData;
  undo(scene: SceneData): SceneData;
}

export class AddNodesCommand implements Command {
  constructor(
    private readonly nodes: SceneNodeData[],
    readonly label = 'Agregar mueble',
  ) {}

  execute(scene: SceneData): SceneData {
    return { ...scene, nodes: [...scene.nodes, ...this.nodes] };
  }

  undo(scene: SceneData): SceneData {
    const ids = new Set(this.nodes.map((node) => node.id));
    return { ...scene, nodes: scene.nodes.filter((node) => !ids.has(node.id)) };
  }
}

export class RemoveNodeCommand implements Command {
  readonly label = 'Eliminar';
  #removed?: { node: SceneNodeData; parentId: string | null; index: number };

  constructor(private readonly id: string) {}

  execute(scene: SceneData): SceneData {
    const result = removeNode(scene.nodes, this.id);
    if (!result.node) return scene;
    this.#removed = { node: result.node, parentId: result.parentId, index: result.index };
    return { ...scene, nodes: result.nodes };
  }

  undo(scene: SceneData): SceneData {
    if (!this.#removed) return scene;
    const { node, parentId, index } = this.#removed;
    return { ...scene, nodes: insertNode(scene.nodes, node, parentId, index) };
  }
}

export class MoveNodeCommand implements Command {
  readonly label = 'Mover';

  constructor(
    private readonly id: string,
    private readonly dx: number,
    private readonly dz: number,
  ) {}

  execute(scene: SceneData): SceneData {
    return { ...scene, nodes: replaceNode(scene.nodes, this.id, (node) => translateNode(node, this.dx, this.dz)) };
  }

  undo(scene: SceneData): SceneData {
    return { ...scene, nodes: replaceNode(scene.nodes, this.id, (node) => translateNode(node, -this.dx, -this.dz)) };
  }
}

export class RotateNodeCommand implements Command {
  readonly label = 'Rotar';

  constructor(
    private readonly id: string,
    private readonly degrees: number,
  ) {}

  execute(scene: SceneData): SceneData {
    return { ...scene, nodes: replaceNode(scene.nodes, this.id, (node) => rotateNode(node, this.degrees)) };
  }

  undo(scene: SceneData): SceneData {
    return { ...scene, nodes: replaceNode(scene.nodes, this.id, (node) => rotateNode(node, -this.degrees)) };
  }
}

type ItemPatch = Partial<Pick<SceneItemData, 'color' | 'finish' | 'addons'>>;

export class UpdateItemCommand implements Command {
  #previous: ItemPatch = {};

  constructor(
    private readonly id: string,
    private readonly patch: ItemPatch,
    readonly label = 'Cambiar mueble',
  ) {}

  execute(scene: SceneData): SceneData {
    return {
      ...scene,
      nodes: replaceNode(scene.nodes, this.id, (node) => {
        if (node.kind !== 'item') return node;
        this.#previous = Object.fromEntries(Object.keys(this.patch).map((key) => [key, node[key as keyof ItemPatch]]));
        return { ...node, ...this.patch };
      }),
    };
  }

  undo(scene: SceneData): SceneData {
    return { ...scene, nodes: replaceNode(scene.nodes, this.id, (node) => ({ ...node, ...this.#previous }) as SceneNodeData) };
  }
}

export class RenameNodeCommand implements Command {
  readonly label = 'Renombrar';
  #previous = '';

  constructor(
    private readonly id: string,
    private readonly name: string,
  ) {}

  execute(scene: SceneData): SceneData {
    return {
      ...scene,
      nodes: replaceNode(scene.nodes, this.id, (node) => {
        this.#previous = node.name;
        return { ...node, name: this.name };
      }),
    };
  }

  undo(scene: SceneData): SceneData {
    return { ...scene, nodes: replaceNode(scene.nodes, this.id, (node) => ({ ...node, name: this.#previous })) };
  }
}

type ScenePatch = Partial<Pick<SceneData, 'room' | 'lighting' | 'style'>>;

export class UpdateSceneCommand implements Command {
  #previous: ScenePatch = {};

  constructor(
    private readonly patch: ScenePatch,
    readonly label = 'Cambiar habitación',
  ) {}

  execute(scene: SceneData): SceneData {
    this.#previous = Object.fromEntries(Object.keys(this.patch).map((key) => [key, scene[key as keyof ScenePatch]]));
    return { ...scene, ...this.patch };
  }

  undo(scene: SceneData): SceneData {
    return { ...scene, ...this.#previous };
  }
}

export class GroupNodesCommand implements Command {
  readonly label = 'Agrupar';

  constructor(
    private readonly ids: string[],
    private readonly group: Pick<SceneGroupData, 'id' | 'name'>,
  ) {}

  execute(scene: SceneData): SceneData {
    const wanted = new Set(this.ids);
    const children = scene.nodes.filter((node) => wanted.has(node.id));
    if (children.length < 2) return scene;
    const index = scene.nodes.findIndex((node) => wanted.has(node.id));
    const rest = scene.nodes.filter((node) => !wanted.has(node.id));
    rest.splice(index, 0, { kind: 'group', ...this.group, children });
    return { ...scene, nodes: rest };
  }

  undo(scene: SceneData): SceneData {
    const group = scene.nodes.find((node) => node.id === this.group.id);
    if (!group || group.kind !== 'group') return scene;
    const index = scene.nodes.indexOf(group);
    const nodes = scene.nodes.filter((node) => node !== group);
    nodes.splice(index, 0, ...group.children);
    return { ...scene, nodes };
  }
}

export class UngroupCommand implements Command {
  readonly label = 'Desagrupar';
  #group?: SceneGroupData;
  #index = -1;

  constructor(private readonly groupId: string) {}

  execute(scene: SceneData): SceneData {
    const index = scene.nodes.findIndex((node) => node.id === this.groupId);
    const group = scene.nodes[index];
    if (!group || group.kind !== 'group') return scene;
    this.#group = group;
    this.#index = index;
    const nodes = [...scene.nodes];
    nodes.splice(index, 1, ...group.children);
    return { ...scene, nodes };
  }

  undo(scene: SceneData): SceneData {
    if (!this.#group) return scene;
    const childIds = new Set(this.#group.children.map((child) => child.id));
    const children = scene.nodes.filter((node) => childIds.has(node.id));
    const nodes = scene.nodes.filter((node) => !childIds.has(node.id));
    nodes.splice(this.#index, 0, { ...this.#group, children });
    return { ...scene, nodes };
  }
}

export class ReplaceSceneCommand implements Command {
  #previous?: SceneData;

  constructor(
    private readonly next: SceneData,
    readonly label = 'Restaurar versión',
  ) {}

  execute(scene: SceneData): SceneData {
    this.#previous = scene;
    return this.next;
  }

  undo(scene: SceneData): SceneData {
    return this.#previous ?? scene;
  }
}

export class CommandHistory {
  #done: Command[] = [];
  #undone: Command[] = [];

  constructor(private readonly limit: number) {}

  execute(command: Command, scene: SceneData): SceneData {
    const next = command.execute(scene);
    if (next === scene) return scene;
    this.#done.push(command);
    if (this.#done.length > this.limit) this.#done.shift();
    this.#undone = [];
    return next;
  }

  undo(scene: SceneData): SceneData {
    const command = this.#done.pop();
    if (!command) return scene;
    this.#undone.push(command);
    return command.undo(scene);
  }

  redo(scene: SceneData): SceneData {
    const command = this.#undone.pop();
    if (!command) return scene;
    this.#done.push(command);
    return command.execute(scene);
  }

  clear(): void {
    this.#done = [];
    this.#undone = [];
  }

  get canUndo(): boolean {
    return this.#done.length > 0;
  }

  get canRedo(): boolean {
    return this.#undone.length > 0;
  }

  get undoLabel(): string | null {
    return this.#done.at(-1)?.label ?? null;
  }

  get redoLabel(): string | null {
    return this.#undone.at(-1)?.label ?? null;
  }
}
