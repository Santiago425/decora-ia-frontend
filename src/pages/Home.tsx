import { LogOut, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { config } from '../config';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const firstName = user.full_name.split(' ')[0];
  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <Logo size={52} />
        {user.role === 'admin' && (
          <span className="badge">
            <ShieldCheck size={14} /> Administrador
          </span>
        )}
        <h1>Hola, {firstName}</h1>
        <p>Tu espacio en {config.appName} está listo. Muy pronto verás aquí tus proyectos.</p>
        <button className="button button-ghost" onClick={logout}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
