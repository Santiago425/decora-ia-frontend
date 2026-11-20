import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { TiltCard } from '../motion';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: (value: number) => string;
  text?: string;
  muted?: boolean;
  tone: 'sage' | 'terracotta' | 'wood' | 'ink';
  delay: number;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  format = (v) => Math.round(v).toString(),
  text,
  muted = false,
  tone,
  delay,
}: StatCardProps) {
  const animated = useCountUp(value);
  return (
    <TiltCard className="stat-tilt">
      <article className={`stat-card tone-${tone}`} style={{ animationDelay: `${delay}ms` }}>
        <span className="stat-icon">
          <Icon size={20} />
        </span>
        <span className="stat-label">{label}</span>
        <strong className={muted ? 'stat-value muted' : 'stat-value'}>{text ?? format(animated)}</strong>
      </article>
    </TiltCard>
  );
}
