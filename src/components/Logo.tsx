import { config } from '../config';

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="var(--ink)" />
      <path d="M12 24.5 24 14l12 10.5V35a1 1 0 0 1-1 1h-7v-8h-8v8h-7a1 1 0 0 1-1-1z" fill="var(--sand-100)" />
      <circle cx="33" cy="15" r="4" fill="var(--terracotta)" />
    </svg>
  );
}

export function Logo({ size = 36, withName = false }: { size?: number; withName?: boolean }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      {withName && <span className="logo-name">{config.appName}</span>}
    </span>
  );
}
