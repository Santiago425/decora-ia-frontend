import { Bot, FolderHeart, Image, RefreshCw, Users, WandSparkles } from 'lucide-react';
import { useCallback } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { adminService } from '../../services/adminService';
import { STATUS_LABELS } from '../dashboard/ProjectCard';
import { StatCard } from '../dashboard/StatCard';
import { ActivityChart } from './ActivityChart';

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  huggingface: 'Hugging Face',
  mock: 'Modo demo',
  local: 'Disco del servidor',
  database: 'Base de datos',
};

function Breakdown({ items, total }: { items: { label: string; value: number }[]; total: number }) {
  return (
    <ul className="breakdown">
      {items.map((item) => (
        <li key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <span className="breakdown-track">
            <span style={{ width: `${total ? (item.value / total) * 100 : 0}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminOverview() {
  const { data, error, loading, retry } = useAsync(useCallback(() => adminService.stats(), []));

  if (error)
    return (
      <div className="inline-error" role="alert">
        <span>{error}</span>
        <button className="button button-ghost" onClick={retry}>
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  if (loading || !data)
    return (
      <div className="stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stat-card skeleton" />
        ))}
      </div>
    );

  const statusItems = Object.entries(STATUS_LABELS).map(([key, label]) => ({ label, value: data.projects_by_status[key] ?? 0 }));
  const styleTotal = data.top_styles.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="admin-overview">
      <section className="stats-grid" aria-label="Totales">
        <StatCard icon={Users} label="Usuarios" value={data.totals.users} tone="sage" delay={0} />
        <StatCard icon={FolderHeart} label="Proyectos" value={data.totals.projects} tone="wood" delay={60} />
        <StatCard icon={WandSparkles} label="Rediseños" value={data.totals.redesigns} tone="terracotta" delay={120} />
        <StatCard icon={Bot} label="Mensajes a Lumi" value={data.totals.assistant_messages} tone="ink" delay={180} />
      </section>

      <section className="admin-grid">
        <article className="panel admin-wide">
          <header className="panel-header">
            <h2>Actividad de los últimos {data.days} días</h2>
          </header>
          <ActivityChart data={data.daily} />
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Proyectos por estado</h2>
          </header>
          <Breakdown items={statusItems} total={data.totals.projects} />
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Estilos más elegidos</h2>
          </header>
          {data.top_styles.length ? (
            <Breakdown items={data.top_styles.map((s) => ({ label: s.name, value: s.count }))} total={styleTotal} />
          ) : (
            <p className="panel-empty">Aún no hay proyectos con estilo.</p>
          )}
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Usuarios</h2>
          </header>
          <dl className="admin-facts">
            <div>
              <dt>Activos</dt>
              <dd>{data.active_users}</dd>
            </div>
            <div>
              <dt>Nuevos ({data.days} días)</dt>
              <dd>{data.new_users}</dd>
            </div>
            <div>
              <dt>Administradores</dt>
              <dd>{data.users_by_role.admin ?? 0}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Servicios conectados</h2>
          </header>
          <dl className="admin-facts">
            <div>
              <dt>
                <Bot size={15} /> IA de texto
              </dt>
              <dd className={`provider provider-${data.providers.text}`}>{PROVIDER_LABELS[data.providers.text] ?? data.providers.text}</dd>
            </div>
            <div>
              <dt>
                <Image size={15} /> IA de imágenes
              </dt>
              <dd className={`provider provider-${data.providers.image}`}>{PROVIDER_LABELS[data.providers.image] ?? data.providers.image}</dd>
            </div>
            <div>
              <dt>
                <FolderHeart size={15} /> Fotos
              </dt>
              <dd className="provider">{PROVIDER_LABELS[data.providers.storage] ?? data.providers.storage}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
