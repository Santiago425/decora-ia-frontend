import { ArrowLeft, Box, Camera, CheckCircle2, CloudOff, Loader2, Redo2, Square, Undo2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectAction, ProjectDetail } from '../../types/project';
import { formatCurrency } from '../../utils/format';
import { STATUS_LABELS } from '../dashboard/ProjectCard';
import type { CameraView } from './EditorCanvas';

export type SaveState = 'saved' | 'pending' | 'saving' | 'error';

const ACTION_LABELS: Record<ProjectAction, string> = {
  start: 'Empezar diseño',
  finish: 'Marcar terminado',
  reopen: 'Reabrir proyecto',
};

const SAVE_LABELS: Record<SaveState, string> = {
  saved: 'Guardado',
  pending: 'Cambios sin guardar',
  saving: 'Guardando…',
  error: 'No se pudo guardar',
};

interface EditorToolbarProps {
  project: ProjectDetail;
  total: number;
  saveState: SaveState;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
  view: CameraView;
  busy: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onView: (view: CameraView) => void;
  onCapture: () => void;
  onRename: (name: string) => void;
  onAction: (action: ProjectAction) => void;
  onRetrySave: () => void;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const { project, saveState } = props;
  const [name, setName] = useState(project.name);
  useEffect(() => setName(project.name), [project.name]);
  const SaveIcon = saveState === 'saving' ? Loader2 : saveState === 'error' ? CloudOff : CheckCircle2;

  return (
    <header className="editor-toolbar">
      <div className="toolbar-title">
        <Link to="/editor" className="icon-button" aria-label="Volver a mis diseños 3D" title="Volver">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <input
            className="inline-input title-input"
            value={name}
            maxLength={120}
            aria-label="Nombre del proyecto"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim().length >= 2 && name.trim() !== project.name && props.onRename(name.trim())}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
          <div className="toolbar-meta">
            <span className={`status-tag status-${project.status}`}>{STATUS_LABELS[project.status]}</span>
            <button
              className={`save-state save-${saveState}`}
              onClick={saveState === 'error' ? props.onRetrySave : undefined}
              disabled={saveState !== 'error'}
              title={saveState === 'error' ? 'Reintentar' : undefined}
            >
              <SaveIcon size={14} className={saveState === 'saving' ? 'spin' : undefined} /> {SAVE_LABELS[saveState]}
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-tools">
        <div className="tool-group" role="group" aria-label="Historial">
          <button className="tool-button" onClick={props.onUndo} disabled={!props.canUndo} title={props.undoLabel ? `Deshacer: ${props.undoLabel} (Ctrl + Z)` : 'Deshacer'}>
            <Undo2 size={18} /> <span>Deshacer</span>
          </button>
          <button className="tool-button" onClick={props.onRedo} disabled={!props.canRedo} title={props.redoLabel ? `Rehacer: ${props.redoLabel} (Ctrl + Y)` : 'Rehacer'}>
            <Redo2 size={18} /> <span>Rehacer</span>
          </button>
        </div>
        <div className="tool-group" role="group" aria-label="Vista">
          <button className="tool-button" aria-pressed={props.view === 'perspective'} onClick={() => props.onView('perspective')} title="Vista 3D">
            <Box size={18} /> <span>3D</span>
          </button>
          <button className="tool-button" aria-pressed={props.view === 'top'} onClick={() => props.onView('top')} title="Vista desde arriba">
            <Square size={18} /> <span>Planta</span>
          </button>
          <button className="tool-button" onClick={props.onCapture} title="Descargar imagen">
            <Camera size={18} /> <span>Captura</span>
          </button>
        </div>
        <div className="toolbar-total">
          <small>Total estimado</small>
          <strong>{formatCurrency(props.total)}</strong>
        </div>
        {project.actions.map((action) => (
          <button
            key={action}
            className={`button ${action === 'finish' ? 'button-primary' : 'button-ghost'} toolbar-action`}
            disabled={props.busy || saveState === 'saving' || saveState === 'pending'}
            onClick={() => props.onAction(action)}
          >
            {ACTION_LABELS[action]}
          </button>
        ))}
      </div>
    </header>
  );
}
