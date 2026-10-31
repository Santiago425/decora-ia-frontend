import { RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { NewProjectForm } from '../components/editor/NewProjectForm';
import { EmptyState } from '../components/EmptyState';
import { useAsync } from '../hooks/useAsync';
import { catalogService } from '../services/catalogService';
import { notificationCenter } from '../services/notificationCenter';
import { projectService } from '../services/projectService';
import type { NewProject } from '../types/project';

export default function EditorHome() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { data, error, loading, retry } = useAsync(
    useCallback(() => Promise.all([projectService.list(), catalogService.roomTypes(), catalogService.styles()]), []),
  );
  const [projects, roomTypes, styles] = data ?? [[], [], []];

  async function create(input: NewProject) {
    setBusy(true);
    try {
      const project = await projectService.create(input);
      notificationCenter.notify('Tu habitación está lista para diseñar', 'success');
      navigate(`/editor/${project.id}`);
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
      setBusy(false);
    }
  }

  return (
    <div className="page editor-home">
      <header className="page-header">
        <h1>Editor 3D</h1>
        <p className="page-subtitle">Diseña tu espacio en tres dimensiones, prueba muebles y conoce el presupuesto al instante.</p>
      </header>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <button className="button button-ghost" onClick={retry}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      <div className="editor-home-grid">
        <NewProjectForm roomTypes={roomTypes} styles={styles} busy={busy} onCreate={create} />

        <section className="editor-home-projects">
          <div className="section-header">
            <h2>Abre un proyecto</h2>
            <span className="muted">{projects.length} en total</span>
          </div>
          {loading && !data && <div className="project-grid">{[0, 1].map((i) => <div key={i} className="project-card skeleton" />)}</div>}
          {data && !projects.length && (
            <EmptyState title="Aún no tienes proyectos" description="Crea el primero con el formulario y empieza a diseñar." />
          )}
          <div className="project-grid">
            {projects.map((project, index) => (
              <Link key={project.id} to={`/editor/${project.id}`} className="project-link" aria-label={`Abrir ${project.name} en el editor`}>
                <ProjectCard project={project} delay={index * 60} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
