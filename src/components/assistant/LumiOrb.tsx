export function LumiOrb({ size = 40, active = false }: { size?: number; active?: boolean }) {
  return (
    <span className={`lumi-avatar ${active ? 'active' : ''}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="var(--sand-50)" />
        <path d="M20 7c1.6 6.4 4.6 9.4 11 11-6.4 1.6-9.4 4.6-11 11-1.6-6.4-4.6-9.4-11-11 6.4-1.6 9.4-4.6 11-11Z" fill="var(--terracotta)" />
        <circle cx="29" cy="11" r="2.2" fill="var(--sage)" />
      </svg>
    </span>
  );
}
