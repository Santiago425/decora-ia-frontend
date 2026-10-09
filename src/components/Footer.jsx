export function Footer({ services }) {
  return (
    <footer>
      <strong>Decora<em>IA</em></strong>
      <ul className="footer-status">
        {services.map((s) => (
          <li key={s.title} className={`status-${s.state}`} title={s.detail}>
            <span className="dot" />
            {s.title}
          </li>
        ))}
      </ul>
      <span>Santiago Campoverde · Never Melo</span>
    </footer>
  );
}
