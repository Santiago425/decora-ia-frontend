import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export default function NotFound() {
  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <Logo size={52} />
        <h1>Esta habitación no existe</h1>
        <p>La página que buscas no está aquí.</p>
        <Link className="button button-primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
