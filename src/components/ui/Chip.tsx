import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export function Chip({ selected = false, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      className={['chip', selected && 'selected', className].filter(Boolean).join(' ')}
      aria-pressed={selected}
      {...rest}
    />
  );
}

export function ChipGroup({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={['chips', className].filter(Boolean).join(' ')} role="group" aria-label={label}>
      {children}
    </div>
  );
}
