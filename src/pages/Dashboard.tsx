import { Crown, FolderHeart, History, Palette, RefreshCw, Wallet, WandSparkles } from 'lucide-react';
import { lazy, Suspense, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ActivityList } from '../components/dashboard/ActivityList';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { StatCard } from '../components/dashboard/StatCard';
import { StyleStrip } from '../components/dashboard/StyleStrip';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { GettingStarted } from '../components/dashboard/GettingStarted';
import { ImageProxy } from '../components/ImageProxy';
import { PatternBadge } from '../components/patterns/PatternBadge';
import { config } from '../config';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, greeting } from '../utils/format';
import { Button, Panel, Skeleton } from '../components/ui';
import { preloadHandlers } from '../routes/pages';
import { projectLabel, projectPath } from '../projects/projectRoute';

/** Keeps the activity panel as tall as the chart beside it. */
const VISIBLE_ACTIVITY = 4;

const StyleUsageChart = lazy(() =>
  import('../components/dashboard/StyleUsageChart').then((m) => ({ default: m.StyleUsageChart })),
);

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, loading, retry } = useAsync(useCallback(() => dashboardService.overview(), []));
  if (!user) return null;
  const firstName = user.full_name.split(' ')[0];

  return (
    <div className="page dashboard">
      <section className="hero-banner">
        <ImageProxy src={config.dashboardBannerUrl} alt="" className="hero-image" />
        <div className="hero-content">
          <span className="hero-kicker">{greeting()}</span>
          <h1>{firstName}, ¿qué espacio transformamos hoy?</h1>
          <PatternBadge ids={['proxy-image', 'proxy-pages', 'singleton-api', 'observer']} />
          <QuickActions />
        </div>
      </section>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <Button variant="ghost" onClick={retry}>
            <RefreshCw size={16} /> Reintentar
          </Button>
        </div>
      )}

      {loading && !data && <DashboardSkeleton />}

      {data && data.stats.projects === 0 && <GettingStarted />}

      {data && data.stats.projects > 0 && (
        <>
          <section className="stats-grid" aria-label="Resumen">
            <StatCard icon={FolderHeart} label="Proyectos creados" value={data.stats.projects} tone="sage" delay={0} />
            <StatCard
              icon={WandSparkles}
              label="Rediseños generados"
              value={data.stats.redesigns}
              tone="terracotta"
              delay={80}
            />
            <StatCard
              icon={Crown}
              label="Estilo favorito"
              value={0}
              text={data.stats.favorite_style?.name ?? 'Por descubrir'}
              muted={!data.stats.favorite_style}
              tone="wood"
              delay={160}
            />
            <StatCard
              icon={Wallet}
              label="Presupuesto estimado"
              value={Number(data.stats.total_budget)}
              format={(v) => formatCurrency(v, { compact: true })}
              tone="ink"
              delay={240}
            />
          </section>

          <section className="dashboard-row">
            <Panel as="article" title="Estilos más usados">
              {data.style_usage.length ? (
                <Suspense fallback={<Skeleton height={180} radius="var(--radius-lg)" />}>
                  <StyleUsageChart data={data.style_usage} />
                </Suspense>
              ) : (
                <p className="panel-empty">
                  <Palette size={18} aria-hidden="true" /> Cuando crees proyectos verás aquí tus estilos preferidos.
                </p>
              )}
            </Panel>
            <Panel as="article" title="Actividad reciente">
              {data.recent_activity.length ? (
                <ActivityList items={data.recent_activity.slice(0, VISIBLE_ACTIVITY)} />
              ) : (
                <p className="panel-empty">
                  <History size={18} aria-hidden="true" /> Aún no hay movimientos.
                </p>
              )}
            </Panel>
          </section>

          <section>
            <header className="section-header">
              <h2>Tus últimos proyectos</h2>
              {data.recent_projects.length > 0 && <Link to="/projects">Ver todos</Link>}
            </header>
            <div className="project-grid">
              {data.recent_projects.map((project, index) => (
                <Link
                  key={project.id}
                  to={projectPath(project)}
                  {...preloadHandlers(projectPath(project))}
                  className="project-link"
                  aria-label={projectLabel(project)}
                >
                  <ProjectCard project={project} delay={index * 70} />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <section>
        <header className="section-header">
          <h2>Explora estilos</h2>
        </header>
        <StyleStrip />
      </section>
    </div>
  );
}
