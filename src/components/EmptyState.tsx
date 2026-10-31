import type { ReactNode } from 'react';

export function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 150" className="empty-illustration" aria-hidden="true">
      <ellipse cx="110" cy="134" rx="92" ry="9" fill="var(--sand-200)" />
      <rect x="34" y="28" width="62" height="46" rx="6" fill="var(--white)" stroke="var(--sand-300)" strokeWidth="2" />
      <path d="M40 66 56 48l10 10 8-8 16 16z" fill="var(--sage-light)" />
      <circle cx="80" cy="42" r="5" fill="var(--terracotta)" opacity="0.7" />
      <rect x="44" y="94" width="124" height="30" rx="12" fill="var(--sage)" />
      <rect x="52" y="78" width="108" height="24" rx="10" fill="var(--sage-dark)" opacity="0.9" />
      <rect x="40" y="88" width="18" height="34" rx="8" fill="var(--sage-dark)" />
      <rect x="154" y="88" width="18" height="34" rx="8" fill="var(--sage-dark)" />
      <path d="M182 124V62" stroke="var(--wood)" strokeWidth="3" />
      <path d="M182 64c-14-4-20-16-18-28 12 2 20 12 18 28zM182 78c12-6 24-4 30 4-10 8-22 6-30-4z" fill="var(--sage)" />
      <rect x="174" y="114" width="16" height="12" rx="3" fill="var(--terracotta)" />
    </svg>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <EmptyIllustration />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
