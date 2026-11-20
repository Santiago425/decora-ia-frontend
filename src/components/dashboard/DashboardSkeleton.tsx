import { Skeleton } from '../ui';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" role="status" aria-label="Cargando tu resumen">
      <div className="stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="stat-card" />
        ))}
      </div>
      <div className="dashboard-row">
        <Skeleton className="panel-skeleton" />
        <Skeleton className="panel-skeleton" />
      </div>
      <div className="project-grid">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="project-skeleton" />
        ))}
      </div>
    </div>
  );
}
