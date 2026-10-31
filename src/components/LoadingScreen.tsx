import { Logo } from './Logo';

export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Cargando">
      <Logo size={48} />
      <span className="loading-bar" />
    </div>
  );
}
