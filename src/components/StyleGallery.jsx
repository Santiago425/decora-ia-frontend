import { STYLES } from '../data/catalog.js';

export function StyleGallery({ selected, onSelect }) {
  return (
    <section className="section" id="estilos">
      <span className="kicker">Colección</span>
      <h2 className="section-title">Elige tu <em>atmósfera</em></h2>
      <p className="section-subtitle">Cinco estilos curados para transformar cualquier espacio de tu hogar.</p>
      <div className="gallery">
        {Object.entries(STYLES).map(([key, s], i) => (
          <button
            type="button"
            key={key}
            className={`gallery-card ${selected === key ? 'selected' : ''}`}
            style={{ '--c1': s.swatch[0], '--c2': s.swatch[1], '--c3': s.swatch[2] }}
            onClick={() => {
              onSelect(key);
              document.getElementById('estudio')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="gallery-art" aria-hidden="true">
              <span className="art-arch" />
              <span className="art-sun" />
              <span className="art-floor" />
            </span>
            <span className="gallery-info">
              <span className="gallery-index">{String(i + 1).padStart(2, '0')}</span>
              <strong>{s.label}</strong>
              <small>{s.description}</small>
              <span className="gallery-cta">{selected === key ? 'Seleccionado' : 'Elegir estilo'} →</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
