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
import { Button, PageHeader, Skeleton } from '../components/ui';
import { preloadHandlers } from '../routes/pages';
import { filterByKind } from '../projects/projectQuery';
import { projectLabel, projectPath } from '../projects/projectRoute';

export default function EditorHome() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { data, error, loading, retry } = useAsync(
    useCallback(() => Promise.all([projectService.list(), catalogService.roomTypes(), catalogService.styles()]), []),
  );
  const [allProjects, roomTypes, styles] = data ?? [[], [], []];
  const projects = filterByKind(allProjects, 'scene');

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
      <PageHeader
        title="Diseñar en 3D"
        subtitle="Arma tu espacio desde cero en tres dimensiones, prueba muebles y conoce el presupuesto al instante."
        patterns={['builder-room', 'prototype']}
      />

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <Button variant="ghost" onClick={retry}>
            <RefreshCw size={16} /> Reintentar
          </Button>
        </div>
      )}

      <div className="editor-home-grid">
        <NewProjectForm roomTypes={roomTypes} styles={styles} busy={busy} onCreate={create} />

        <section className="editor-home-projects">
          <div className="section-header">
            <h2>Tus habitaciones en 3D</h2>
            <span className="muted">{projects.length} en total</span>
          </div>
          {loading && !data && (
            <div className="project-grid">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="project-card" />
              ))}
            </div>
          )}
          {data && !projects.length && (
            <EmptyState
              title="Aún no tienes habitaciones en 3D"
              description="Crea la primera con el formulario y empieza a diseñar."
            />
          )}
          <div className="project-grid">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={projectPath(project)}
                {...preloadHandlers(projectPath(project))}
                className="project-link"
                aria-label={projectLabel(project)}
              >
                <ProjectCard project={project} delay={index * 60} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
