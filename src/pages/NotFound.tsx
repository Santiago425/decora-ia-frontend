import { Logo } from '../components/Logo';
import { ButtonLink } from '../components/ui';

export default function NotFound() {
  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <Logo size={52} />
        <h1>Esta habitación no existe</h1>
        <p>La página que buscas no está aquí.</p>
        <ButtonLink to="/">Volver al inicio</ButtonLink>
      </div>
    </div>
  );
}
