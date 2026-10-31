import { useState } from 'react';
import type { ProjectStatus, ProjectSummary } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import { ImageProxy } from '../ImageProxy';

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  in_design: 'En diseño',
  finished: 'Terminado',
};

export function ProjectCard({ project, delay }: { project: ProjectSummary; delay: number }) {
  const [split, setSplit] = useState(50);
  const hasComparison = project.before_image_url && project.after_image_url;

  return (
    <article className="project-card" style={{ animationDelay: `${delay}ms` }}>
      <div
        className="project-thumb"
        onPointerMove={(e) => {
          if (!hasComparison) return;
          const box = e.currentTarget.getBoundingClientRect();
          setSplit(Math.min(100, Math.max(0, ((e.clientX - box.left) / box.width) * 100)));
        }}
        onPointerLeave={() => setSplit(50)}
      >
        <ImageProxy src={project.after_image_url ?? project.before_image_url} alt={`Diseño de ${project.name}`} />
        {hasComparison && (
          <>
            <div className="thumb-before" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <ImageProxy src={project.before_image_url} alt={`Foto original de ${project.name}`} />
            </div>
            <span className="thumb-divider" style={{ left: `${split}%` }} />
            <span className="thumb-tag before">Antes</span>
            <span className="thumb-tag after">Después</span>
          </>
        )}
        <span className={`status-pill status-${project.status}`}>{STATUS_LABELS[project.status]}</span>
      </div>
      <div className="project-body">
        <h3>{project.name}</h3>
        <p>{[project.room_type_name, project.style_name].filter(Boolean).join(' · ')}</p>
        <strong>{formatCurrency(project.estimated_budget)}</strong>
      </div>
    </article>
  );
}
