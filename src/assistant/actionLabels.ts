import type { AssistantAction, AssistantActionType } from '../types/assistant';

export const ACTION_LABELS: Record<AssistantActionType, string> = {
  navigate: 'Te llevé a otra sección',
  open_project: 'Abrió el proyecto',
  start_redesign: 'Preparó el rediseño',
  add_furniture: 'Agregó un mueble',
  change_style: 'Cambió el estilo',
  change_wall: 'Cambió las paredes',
  change_floor: 'Cambió el piso',
  set_lighting: 'Ajustó la luz',
  undo: 'Deshizo un cambio',
  redo: 'Rehizo un cambio',
  rotate_selected: 'Giró el mueble',
  remove_selected: 'Quitó el mueble',
  duplicate_selected: 'Duplicó el mueble',
};

/** Actions that leave one entry in the editor's undo history. */
const UNDOABLE: ReadonlySet<AssistantActionType> = new Set([
  'add_furniture',
  'change_style',
  'change_wall',
  'change_floor',
  'set_lighting',
  'rotate_selected',
  'remove_selected',
  'duplicate_selected',
]);

export const isUndoable = (action: AssistantAction) => UNDOABLE.has(action.type);

export function describeAction(action: AssistantAction): string {
  return action.type === 'add_furniture' && action.params.name
    ? `Agregó ${action.params.name}`
    : ACTION_LABELS[action.type];
}
