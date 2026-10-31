import { FolderPlus, WandSparkles } from 'lucide-react';
import type { ActivityItem } from '../../types/dashboard';
import { formatRelativeTime } from '../../utils/format';

const LABELS = { project: 'Proyecto creado', redesign: 'Rediseño generado' };

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="activity-list">
      {items.map((item) => (
        <li key={`${item.kind}-${item.project_id}-${item.happened_at}`}>
          <span className={`activity-icon ${item.kind}`}>
            {item.kind === 'redesign' ? <WandSparkles size={16} /> : <FolderPlus size={16} />}
          </span>
          <div>
            <strong>{item.title}</strong>
            <small>{LABELS[item.kind]}</small>
          </div>
          <time dateTime={item.happened_at}>{formatRelativeTime(item.happened_at)}</time>
        </li>
      ))}
    </ol>
  );
}
