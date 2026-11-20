import type { ReactNode } from 'react';
import { PatternBadge } from '../patterns/PatternBadge';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  patterns?: string[];
}

export function PageHeader({ title, subtitle, eyebrow, actions, className, patterns }: PageHeaderProps) {
  return (
    <header className={['page-header', className].filter(Boolean).join(' ')}>
      <div className="page-header-text">
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {patterns && <PatternBadge ids={patterns} />}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
