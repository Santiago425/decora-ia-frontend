import { PATTERNS } from '../data/catalog.js';

export function PatternsSection() {
  return (
    <section className="section" id="patrones">
      <h2 className="section-title">Patrones de diseño aplicados</h2>
      <p className="section-subtitle">DecoraIA está construida sobre cinco patrones GoF.</p>
      <div className="patterns">
        {PATTERNS.map((p) => (
          <article key={p.name} className="card pattern">
            <span className="pattern-icon">{p.icon}</span>
            <div>
              <h3>{p.name}</h3>
              <span className="badge badge-soft">{p.kind}</span>
              <p>{p.where}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
