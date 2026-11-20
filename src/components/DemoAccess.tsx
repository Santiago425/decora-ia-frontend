import { ShieldCheck, Sparkles, User } from 'lucide-react';
import { usePublicMeta } from '../hooks/usePublicMeta';
import type { DemoAccount } from '../types/meta';

const ROLE_COPY = {
  user: { label: 'Usuario', hint: 'Con proyectos de ejemplo', Icon: User },
  admin: { label: 'Administrador', hint: 'Panel y estadísticas', Icon: ShieldCheck },
} as const;

export function DemoAccess({ disabled, onSelect }: { disabled?: boolean; onSelect: (account: DemoAccount) => void }) {
  const { data } = usePublicMeta();
  const accounts = data?.demo_accounts ?? [];
  if (accounts.length === 0) return null;

  return (
    <section className="demo-access" aria-labelledby="demo-access-title">
      <h2 id="demo-access-title">
        <Sparkles size={15} aria-hidden="true" /> Acceso de prueba
      </h2>
      <p>Entra con un clic, sin escribir nada.</p>
      <div className="demo-access-buttons">
        {accounts.map((account) => {
          const { label, hint, Icon } = ROLE_COPY[account.role];
          return (
            <button
              key={account.email}
              type="button"
              className={`demo-account ${account.role}`}
              disabled={disabled}
              onClick={() => onSelect(account)}
              aria-label={`Entrar como ${label.toLowerCase()} de prueba (${account.name})`}
            >
              <span className="demo-account-icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              <span className="demo-account-text">
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
