import { useEffect, useState } from 'react';

export function Navbar({ apiState }) {
  const [scrolled, setScrolled] = useState(false);
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
      <a href="#estudio" className="btn btn-primary btn-small">Diseñar</a>
    </nav>
  );
}
