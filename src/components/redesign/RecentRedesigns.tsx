import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { useAsync } from '../../hooks/useAsync';
import { applyQuery, DEFAULT_QUERY } from '../../projects/projectQuery';
import { projectLabel, projectPath } from '../../projects/projectRoute';
import { projectService } from '../../services/projectService';
import { ProjectCard } from '../dashboard/ProjectCard';

/** Photo redesigns only, so this section never mixes in the rooms made in the 3D editor. */
export function RecentRedesigns() {
  const { data } = useAsync(useCallback(() => projectService.list(), []));
  const redesigns = applyQuery(data ?? [], { ...DEFAULT_QUERY, kind: 'redesign' }).slice(
    0,
    config.recentRedesignsLimit,
  );
  if (!redesigns.length) return null;

  return (
    <section className="recent-redesigns" aria-labelledby="recent-redesigns-title">
      <div className="section-header">
        <h2 id="recent-redesigns-title">Tus rediseños</h2>
        <Link to="/projects" className="muted">
          Ver todos
        </Link>
      </div>
      <div className="project-grid">
        {redesigns.map((project, index) => (
          <Link key={project.id} to={projectPath(project)} className="project-link" aria-label={projectLabel(project)}>
            <ProjectCard project={project} delay={index * 60} />
          </Link>
        ))}
      </div>
    </section>
  );
}
