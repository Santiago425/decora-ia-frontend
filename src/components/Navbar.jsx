import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

export function Navbar({ apiState }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, openAuth, logout } = useAuth();
  const label = { up: 'Servidor en línea', down: 'Servidor sin conexión', loading: 'Conectando…' }[apiState];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-solid' : ''}`}>
      <a href="#inicio" className="brand">
        Decora<em>IA</em>
      </a>
      <div className="nav-links">
        <a href="#estilos">Estilos</a>
        <a href="#estudio">Estudio</a>
        <a href="#como-funciona">Cómo funciona</a>
      </div>
      <span className={`pill pill-${apiState}`} title={label}>
        <span className="dot" />
        <span className="pill-text">{label}</span>
      </span>
      {user ? (
        <div className="user-menu">
          <span className="avatar" aria-hidden="true">{user.fullName.trim().charAt(0).toUpperCase()}</span>
          <span className="user-name">{user.fullName.split(' ')[0]}</span>
          <button type="button" className="link-button" onClick={logout}>Salir</button>
        </div>
      ) : (
        <>
          <button type="button" className="link-button nav-login" onClick={() => openAuth('login')}>Ingresar</button>
          <button type="button" className="btn btn-primary btn-small" onClick={() => openAuth('register')}>Crear cuenta</button>
        </>
      )}
    </nav>
  );
}
