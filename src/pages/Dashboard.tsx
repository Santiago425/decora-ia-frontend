import { Crown, FolderHeart, RefreshCw, Wallet, WandSparkles } from 'lucide-react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ActivityList } from '../components/dashboard/ActivityList';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { StatCard } from '../components/dashboard/StatCard';
import { StyleStrip } from '../components/dashboard/StyleStrip';
import { StyleUsageChart } from '../components/dashboard/StyleUsageChart';
import { EmptyState } from '../components/EmptyState';
import { ImageProxy } from '../components/ImageProxy';
import { config } from '../config';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, greeting } from '../utils/format';

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
          <QuickActions />
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
        <div className="stats-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="stat-card skeleton" />
          ))}
        </div>
      )}

      {data && (
        <>
          <section className="stats-grid" aria-label="Resumen">
            <StatCard icon={FolderHeart} label="Proyectos creados" value={data.stats.projects} tone="sage" delay={0} />
            <StatCard icon={WandSparkles} label="Rediseños generados" value={data.stats.redesigns} tone="terracotta" delay={80} />
            <StatCard
              icon={Crown}
              label="Estilo favorito"
              value={0}
              text={data.stats.favorite_style?.name ?? 'Por descubrir'}
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
            <article className="panel">
              <header className="panel-header">
                <h2>Estilos más usados</h2>
              </header>
              {data.style_usage.length ? (
                <StyleUsageChart data={data.style_usage} />
              ) : (
                <p className="panel-empty">Cuando crees proyectos verás aquí tus estilos preferidos.</p>
              )}
            </article>
            <article className="panel">
              <header className="panel-header">
                <h2>Actividad reciente</h2>
              </header>
              {data.recent_activity.length ? (
                <ActivityList items={data.recent_activity} />
              ) : (
                <p className="panel-empty">Aún no hay movimientos.</p>
              )}
            </article>
          </section>

          <section>
            <header className="section-header">
              <h2>Tus últimos proyectos</h2>
              {data.recent_projects.length > 0 && <Link to="/projects">Ver todos</Link>}
            </header>
            {data.recent_projects.length ? (
              <div className="project-grid">
                {data.recent_projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} delay={index * 70} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Tu primer proyecto te espera"
                description={`Sube una foto o pídeselo a ${config.assistantName} y empieza a diseñar.`}
                action={
                  <Link to="/redesign" className="button button-primary">
                    <WandSparkles size={18} /> Crear un rediseño
                  </Link>
                }
              />
            )}
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
