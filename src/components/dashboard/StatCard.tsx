import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: (value: number) => string;
  text?: string;
  tone: 'sage' | 'terracotta' | 'wood' | 'ink';
  delay: number;
}

export function StatCard({ icon: Icon, label, value, format = (v) => Math.round(v).toString(), text, tone, delay }: StatCardProps) {
  const animated = useCountUp(value);
  return (
    <article className={`stat-card tone-${tone}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="stat-icon">
        <Icon size={20} />
      </span>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{text ?? format(animated)}</strong>
    </article>
  );
}
