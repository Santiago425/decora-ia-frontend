import { useSyncExternalStore } from 'react';
import type { SceneData } from '../types/project';
import { CommandHistory, type Command } from './commands';

export interface EditorState {
  scene: SceneData;
  selection: string[];
  readOnly: boolean;
  revision: number;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
}

type Listener = () => void;

// Observer: the canvas, panels and toolbar subscribe to the store and re-render when the scene changes.
export class EditorStore {
  #history: CommandHistory;
  #listeners = new Set<Listener>();
  #state: EditorState;

  constructor(scene: SceneData, { historyLimit, readOnly }: { historyLimit: number; readOnly: boolean }) {
    this.#history = new CommandHistory(historyLimit);
    this.#state = this.#withHistory({ scene, selection: [], readOnly, revision: 0 });
  }

  subscribe = (listener: Listener) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  getState = () => this.#state;

  execute(command: Command): boolean {
    if (this.#state.readOnly) return false;
    const scene = this.#history.execute(command, this.#state.scene);
    if (scene === this.#state.scene) return false;
    this.#commit(scene);
    return true;
  }

  undo(): void {
    if (this.#state.readOnly || !this.#history.canUndo) return;
    this.#commit(this.#history.undo(this.#state.scene));
  }

  redo(): void {
    if (this.#state.readOnly || !this.#history.canRedo) return;
    this.#commit(this.#history.redo(this.#state.scene));
  }

  select(ids: string[]): void {
    this.#set({ selection: ids });
  }

  toggleSelection(id: string): void {
    const { selection } = this.#state;
    this.#set({ selection: selection.includes(id) ? selection.filter((s) => s !== id) : [...selection, id] });
  }

  load(scene: SceneData): void {
    this.#history.clear();
    this.#set({ scene, selection: [] });
  }

  setReadOnly(readOnly: boolean): void {
    this.#set({ readOnly });
  }

  #commit(scene: SceneData): void {
    const ids = new Set(scene.nodes.map((node) => node.id));
    this.#set({ scene, revision: this.#state.revision + 1, selection: this.#state.selection.filter((id) => ids.has(id)) });
  }

  #withHistory(state: Omit<EditorState, 'canUndo' | 'canRedo' | 'undoLabel' | 'redoLabel'>): EditorState {
    return {
      ...state,
      canUndo: this.#history.canUndo,
      canRedo: this.#history.canRedo,
      undoLabel: this.#history.undoLabel,
      redoLabel: this.#history.redoLabel,
    };
  }

  #set(patch: Partial<EditorState>): void {
    this.#state = this.#withHistory({ ...this.#state, ...patch });
    this.#listeners.forEach((listener) => listener());
  }
}

export function useEditorState(store: EditorStore): EditorState {
  return useSyncExternalStore(store.subscribe, store.getState);
}
