import { Box, Camera, Sparkles } from 'lucide-react';
import { Suspense, lazy, type ReactNode } from 'react';
import { config } from '../config';
import { Logo } from './Logo';
import { PhotoCarousel } from './media/PhotoCarousel';
import { PhotoCredits } from './PhotoCredits';
import { SceneBoundary } from './three/SceneBoundary';

const LoginRoom = lazy(() => import('./three/LoginRoom'));

const HIGHLIGHTS = [
  { Icon: Camera, title: 'Rediseña con una foto', text: 'Elige un estilo y compara el antes y el después.' },
  { Icon: Box, title: 'Arma tu espacio en 3D', text: 'Mueve, gira y cambia muebles con medidas reales.' },
  { Icon: Sparkles, title: `Pídeselo a ${config.assistantName}`, text: 'Tu asistente entiende voz y texto.' },
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-backdrop" aria-hidden="true">
        <PhotoCarousel photos={config.authImageUrls} className="auth-carousel" />
        <div className="auth-veil" />
      </div>
      <section className="auth-photos">
        <div className="auth-logo">
          <Logo size={40} withName />
        </div>
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
        <PhotoCredits />
      </section>
      <section className="auth-stage">
        <div className="auth-aurora" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="auth-room" aria-hidden="true">
          <SceneBoundary>
            <Suspense fallback={null}>
              <LoginRoom />
            </Suspense>
          </SceneBoundary>
        </div>
        <main className="auth-card">
          <header className="auth-header">
            <span className="auth-brand">{config.appName}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
        </main>
      </section>
    </div>
  );
}
