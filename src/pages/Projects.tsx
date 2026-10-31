import { Box, Copy, Pencil, Plus, RefreshCw, Search, Trash2, WandSparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ProjectCard, STATUS_LABELS } from '../components/dashboard/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { useAsync } from '../hooks/useAsync';
import { applyQuery, DEFAULT_QUERY, SORT_STRATEGIES, type KindFilter, type ProjectQuery, type SortKey } from '../projects/projectQuery';
import { notificationCenter } from '../services/notificationCenter';
import { projectService } from '../services/projectService';
import type { ProjectStatus, ProjectSummary } from '../types/dashboard';
import { formatCurrency } from '../utils/format';

const STATUS_FILTERS: (ProjectStatus | 'all')[] = ['all', 'draft', 'in_design', 'finished'];
const KIND_LABELS: Record<KindFilter, string> = { all: 'Todos', redesign: 'Con rediseño de foto', scene: 'Solo editor 3D' };

function RenameForm({ project, onDone }: { project: ProjectSummary; onDone: (name?: string) => void }) {
  const [name, setName] = useState(project.name);
  function submit(event: FormEvent) {
    event.preventDefault();
    onDone(name.trim() && name.trim() !== project.name ? name.trim() : undefined);
  }
  return (
    <form className="rename-form" onSubmit={submit}>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus aria-label="Nuevo nombre" onBlur={submit} />
    </form>
  );
}

export default function Projects() {
  const { data, error, loading, retry } = useAsync(useCallback(() => projectService.list(), []));
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [query, setQuery] = useState<ProjectQuery>(DEFAULT_QUERY);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ProjectSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (data) setProjects(data);
  }, [data]);

  const visible = useMemo(() => applyQuery(projects, query), [projects, query]);
  const total = useMemo(() => projects.reduce((sum, p) => sum + Number(p.estimated_budget), 0), [projects]);
  const update = (patch: Partial<ProjectQuery>) => setQuery((current) => ({ ...current, ...patch }));

  async function duplicate(project: ProjectSummary) {
    setBusy(project.id);
    try {
      await projectService.duplicate(project.id);
      setProjects(await projectService.list());
      notificationCenter.notify(`Duplicaste "${project.name}"`, 'success');
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  }

  async function rename(project: ProjectSummary, name?: string) {
    setRenaming(null);
    if (!name) return;
    try {
      await projectService.update(project.id, { name });
      setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, name } : p)));
      notificationCenter.notify('Nombre actualizado', 'success');
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(toDelete.id);
    try {
      await projectService.remove(toDelete.id);
      setProjects((list) => list.filter((p) => p.id !== toDelete.id));
      notificationCenter.notify(`Eliminaste "${toDelete.name}"`, 'success');
      setToDelete(null);
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page projects-page">
      <header className="page-header projects-header">
        <div>
          <h1>Mis proyectos</h1>
          <p className="page-subtitle">
            {projects.length > 0
              ? `${projects.length} ${projects.length === 1 ? 'proyecto' : 'proyectos'} · ${formatCurrency(total)} en presupuesto estimado`
              : 'Aquí aparecen tus rediseños y tus habitaciones en 3D.'}
          </p>
        </div>
        <div className="header-actions">
          <Link to="/redesign" className="button button-ghost">
            <WandSparkles size={18} /> Rediseñar foto
          </Link>
          <Link to="/editor" className="button button-primary">
            <Plus size={18} /> Nuevo proyecto
          </Link>
        </div>
      </header>

      <section className="projects-toolbar" aria-label="Buscar y filtrar">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            value={query.text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Buscar por nombre, estilo o habitación"
            aria-label="Buscar proyectos"
          />
        </label>
        <div className="chips" role="group" aria-label="Estado">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              className={`chip ${query.status === status ? 'selected' : ''}`}
              aria-pressed={query.status === status}
              onClick={() => update({ status })}
            >
              {status === 'all' ? 'Todos' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        <div className="toolbar-selects">
          <select value={query.kind} onChange={(e) => update({ kind: e.target.value as KindFilter })} aria-label="Tipo de proyecto">
            {Object.entries(KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select value={query.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} aria-label="Ordenar">
            {Object.entries(SORT_STRATEGIES).map(([value, strategy]) => (
              <option key={value} value={value}>
                {strategy.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button className="button button-ghost" onClick={retry}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {loading && !data && (
        <div className="project-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="project-card skeleton project-skeleton" />
          ))}
        </div>
      )}

      {data && projects.length === 0 && (
        <EmptyState
          title="Todavía no tienes proyectos"
          description="Sube una foto para rediseñarla con IA o arma una habitación desde cero en el editor 3D."
          action={
            <Link to="/editor" className="button button-primary">
              <Box size={18} /> Crear mi primer proyecto
            </Link>
          }
        />
      )}

      {data && projects.length > 0 && visible.length === 0 && (
        <EmptyState
          title="Nada coincide con tu búsqueda"
          description="Prueba con otro nombre o quita algunos filtros."
          action={
            <button className="button button-ghost" onClick={() => setQuery(DEFAULT_QUERY)}>
              Limpiar filtros
            </button>
          }
        />
      )}

      {visible.length > 0 && (
        <section className="project-grid" aria-label="Proyectos">
          {visible.map((project, index) => (
            <div key={project.id} className="project-item">
              <Link to={`/editor/${project.id}`} className="project-link" aria-label={`Abrir ${project.name} en el editor 3D`}>
                <ProjectCard project={project} delay={Math.min(index, 8) * 50} />
              </Link>
              <div className="project-actions">
                {renaming === project.id ? (
                  <RenameForm project={project} onDone={(name) => rename(project, name)} />
                ) : (
                  <>
                    <button className="icon-button" onClick={() => setRenaming(project.id)} title="Cambiar nombre" aria-label={`Cambiar nombre de ${project.name}`}>
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => duplicate(project)}
                      disabled={busy === project.id}
                      title="Duplicar"
                      aria-label={`Duplicar ${project.name}`}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => setToDelete(project)}
                      title="Eliminar"
                      aria-label={`Eliminar ${project.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar este proyecto?"
        message={toDelete ? `"${toDelete.name}" se borrará junto con sus rediseños y versiones. No se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        danger
        busy={busy === toDelete?.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
