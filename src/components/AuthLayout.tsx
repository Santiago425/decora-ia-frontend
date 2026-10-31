import type { ReactNode } from 'react';
import { config } from '../config';
import { Logo } from './Logo';
import { PhotoCredits } from './PhotoCredits';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      {config.authImageUrl && (
        <img className="auth-background" src={config.authImageUrl} alt="" referrerPolicy="no-referrer" />
      )}
      <div className="auth-veil" aria-hidden="true" />
      <main className="auth-card">
        <header className="auth-header">
          <Logo size={44} />
          <span className="auth-brand">{config.appName}</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        {children}
      </main>
      <PhotoCredits />
    </div>
  );
}
