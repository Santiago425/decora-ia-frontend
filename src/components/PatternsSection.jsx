import { PATTERNS } from '../data/catalog.js';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

export function PatternsSection() {
  return (
    <section className="section" id="patrones">
      <span className="kicker">Arquitectura</span>
      <h2 className="section-title">Patrones de <em>diseño</em></h2>
      <p className="section-subtitle">DecoraIA está construida sobre cinco patrones GoF.</p>
      <div className="patterns">
        {PATTERNS.map((p, i) => (
          <article key={p.name} className="pattern">
            <span className="pattern-numeral">{NUMERALS[i]}</span>
            <h3>{p.name}</h3>
            <span className="pattern-kind">{p.kind}</span>
            <p>{p.where}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
