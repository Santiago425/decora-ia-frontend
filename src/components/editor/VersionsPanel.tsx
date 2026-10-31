import { History, RotateCcw, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { VersionSummary } from '../../types/project';
import { formatCurrency, formatRelativeTime } from '../../utils/format';

interface VersionsPanelProps {
  versions: VersionSummary[] | null;
  disabled: boolean;
  busy: boolean;
  onSave: (label: string) => Promise<void>;
  onRestore: (version: VersionSummary) => void;
}

export function VersionsPanel({ versions, disabled, busy, onSave, onRestore }: VersionsPanelProps) {
  const [label, setLabel] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    await onSave(label.trim());
    setLabel('');
  }

  return (
    <div className="versions-panel">
      <form className="version-form" onSubmit={submit}>
        <input
          placeholder="Ej. Sofá junto a la ventana"
          value={label}
          maxLength={80}
          onChange={(e) => setLabel(e.target.value)}
          aria-label="Nombre de la versión"
        />
        <button className="button button-primary" disabled={busy || !label.trim()}>
          <Save size={16} /> Guardar
        </button>
      </form>
      <p className="panel-hint">Guarda una versión antes de probar cambios grandes. Puedes volver a ella cuando quieras.</p>
      <ul className="version-list">
        {versions?.map((version) => (
          <li key={version.id}>
            <History size={18} aria-hidden="true" />
            <span>
              <strong>{version.label}</strong>
              <small>
                {formatRelativeTime(version.created_at)} · {version.items} muebles · {formatCurrency(version.estimated_budget)}
              </small>
            </span>
            <button className="tool-button" disabled={disabled} onClick={() => onRestore(version)} title="Volver a esta versión">
              <RotateCcw size={16} /> <span>Usar</span>
            </button>
          </li>
        ))}
        {versions && !versions.length && <li className="panel-empty">Todavía no guardaste versiones.</li>}
        {!versions && <li className="panel-empty">Cargando versiones…</li>}
      </ul>
    </div>
  );
}
