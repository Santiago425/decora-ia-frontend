import { Box, Camera, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { config } from '../config';
import { Logo } from './Logo';
import { PhotoCredits } from './PhotoCredits';

const HIGHLIGHTS = [
  { Icon: Camera, title: 'Rediseña con una foto', text: 'Elige un estilo y compara el antes y el después.' },
  { Icon: Box, title: 'Arma tu espacio en 3D', text: 'Mueve, gira y cambia muebles con medidas reales.' },
  { Icon: Sparkles, title: `Pídeselo a ${config.assistantName}`, text: 'Tu asistente entiende voz y texto.' },
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      {config.authImageUrl && (
        <img className="auth-background" src={config.authImageUrl} alt="" referrerPolicy="no-referrer" />
      )}
      <div className="auth-veil" aria-hidden="true" />
      <div className="auth-shell">
        <aside className="auth-showcase">
          <span className="auth-showcase-kicker">Diseño de interiores con IA</span>
          <p className="auth-showcase-title">Imagina tu casa antes de mover un solo mueble.</p>
          <ul>
            {HIGHLIGHTS.map(({ Icon, title: highlight, text }) => (
              <li key={highlight}>
                <span aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{highlight}</strong>
                  <small>{text}</small>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <main className="auth-card">
          <header className="auth-header">
            <Logo size={44} />
            <span className="auth-brand">{config.appName}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
        </main>
      </div>
      <PhotoCredits />
    </div>
  );
}
