import { ArrowRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_QUERY, queryToParams } from '../../projects/projectQuery';
import { STATUS_LABELS, STATUS_ORDER, statusBreakdown } from '../../projects/projectStatus';
import type { ProjectStatus, ProjectSummary } from '../../types/dashboard';
import { Panel } from '../ui';

const statusLink = (status: ProjectStatus) => `/projects?${queryToParams({ ...DEFAULT_QUERY, status }).toString()}`;

/** Shows how many projects sit in each state and links each one to its filtered list. */
export function ProjectProgress({ projects }: { projects: ProjectSummary[] }) {
  const { total, counts, finishedShare } = statusBreakdown(projects);
  if (!total) return null;
  const pending = counts.draft + counts.in_design;

  return (
    <Panel
      as="article"
      className="progress-panel"
      title="Tu progreso"
      description={
        pending
          ? `${pending} ${pending === 1 ? 'proyecto espera' : 'proyectos esperan'} a que los termines.`
          : '¡Terminaste todos tus proyectos!'
      }
      actions={
        <span className="progress-share">
          <Target size={18} aria-hidden="true" />
          <strong>{finishedShare}%</strong> terminado
        </span>
      }
    >
      <div
        className="progress-track"
        role="img"
        aria-label={STATUS_ORDER.map((status) => `${STATUS_LABELS[status]}: ${counts[status]}`).join(', ')}
      >
        {STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => (
          <span key={status} className={`progress-segment status-${status}`} style={{ flexGrow: counts[status] }} />
        ))}
      </div>
      <ul className="progress-legend">
        {STATUS_ORDER.map((status) => (
          <li key={status}>
            <Link to={statusLink(status)} className="progress-item">
              <span className={`progress-dot status-${status}`} aria-hidden="true" />
              <span className="progress-label">{STATUS_LABELS[status]}</span>
              <strong>{counts[status]}</strong>
              <ArrowRight size={16} className="progress-arrow" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
