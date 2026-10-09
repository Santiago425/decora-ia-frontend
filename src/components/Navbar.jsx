export function Navbar({ apiState }) {
  const label = { up: 'Servidor en línea', down: 'Servidor sin conexión', loading: 'Conectando…' }[apiState];
  return (
    <nav className="navbar">
      <a href="#inicio" className="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        DecoraIA
      </a>
      <div className="nav-links">
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#estudio">Estudio</a>
        <a href="#patrones">Patrones</a>
      </div>
      <span className={`pill pill-${apiState}`} title={label}>
        <span className="dot" />
        <span className="pill-text">{label}</span>
      </span>
    </nav>
  );
}
