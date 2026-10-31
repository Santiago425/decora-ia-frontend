import { ShieldCheck, User } from 'lucide-react';
import type { UserRole } from '../types/auth';

const OPTIONS: { value: UserRole; label: string; Icon: typeof User }[] = [
  { value: 'user', label: 'Usuario', Icon: User },
  { value: 'admin', label: 'Administrador', Icon: ShieldCheck },
];

export function RoleSwitch({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
  return (
    <div className="role-switch" role="radiogroup" aria-label="Tipo de cuenta" data-active={value}>
      <span className="role-switch-thumb" aria-hidden="true" />
      {OPTIONS.map(({ value: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          className={value === option ? 'active' : ''}
          onClick={() => onChange(option)}
        >
          <Icon size={16} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}
