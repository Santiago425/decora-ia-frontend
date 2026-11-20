import { Bot, FolderHeart, Image, RefreshCw, Users, WandSparkles } from 'lucide-react';
import { useCallback } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { usePublicMeta } from '../../hooks/usePublicMeta';
import { adminService } from '../../services/adminService';
import { providerLabel } from '../../services/metaService';
import { STATUS_LABELS } from '../../projects/projectStatus';
import { StatCard } from '../dashboard/StatCard';
import { ActivityChart } from './ActivityChart';
import { Button, Panel, Skeleton } from '../ui';

function providerClass(key: string) {
  return `provider ${key === 'mock' ? 'provider-mock' : 'provider-live'}`;
}

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
  const { data: meta } = usePublicMeta();

  if (error)
    return (
      <div className="inline-error" role="alert">
        <span>{error}</span>
        <Button variant="ghost" onClick={retry}>
          <RefreshCw size={16} /> Reintentar
        </Button>
      </div>
    );
  if (loading || !data)
    return (
      <div className="stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="stat-card" />
        ))}
      </div>
    );

  const statusItems = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    label,
    value: data.projects_by_status[key] ?? 0,
  }));
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
        <Panel as="article" title={<>Actividad de los últimos {data.days} días</>} className="admin-wide">
          <ActivityChart data={data.daily} />
        </Panel>

        <Panel as="article" title="Proyectos por estado">
          <Breakdown items={statusItems} total={data.totals.projects} />
        </Panel>

        <Panel as="article" title="Estilos más elegidos">
          {data.top_styles.length ? (
            <Breakdown items={data.top_styles.map((s) => ({ label: s.name, value: s.count }))} total={styleTotal} />
          ) : (
            <p className="panel-empty">Aún no hay proyectos con estilo.</p>
          )}
        </Panel>

        <Panel as="article" title="Usuarios">
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
        </Panel>

        <Panel as="article" title="Servicios conectados">
          <dl className="admin-facts">
            <div>
              <dt>
                <Bot size={15} /> IA de texto
              </dt>
              <dd className={providerClass(data.providers.text)}>{providerLabel(meta, data.providers.text)}</dd>
            </div>
            <div>
              <dt>
                <Image size={15} /> IA de imágenes
              </dt>
              <dd className={providerClass(data.providers.image)}>
                {providerLabel(meta, data.providers.image)}
                {data.providers.image_fallback && data.providers.image_fallback !== 'none' && (
                  <small className="provider-fallback">
                    respaldo: {providerLabel(meta, data.providers.image_fallback)}
                  </small>
                )}
              </dd>
            </div>
            <div>
              <dt>
                <FolderHeart size={15} /> Fotos
              </dt>
              <dd className="provider">{providerLabel(meta, data.providers.storage)}</dd>
            </div>
          </dl>
        </Panel>
      </section>
    </div>
  );
}
