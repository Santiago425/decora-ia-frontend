import type { ReactNode } from 'react';

export type BadgeTone = 'primary' | 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export function Badge({
  tone = 'primary',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={['badge', `badge-${tone}`, className].filter(Boolean).join(' ')}>{children}</span>;
}
