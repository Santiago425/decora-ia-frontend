import { SAMPLE_PHOTO } from '../data/catalog.js';
import { SafeImage } from './SafeImage.jsx';

export function Hero() {
  return (
    <header className="hero" id="inicio">
      <div className="hero-text">
        <span className="eyebrow">Proyecto final · Patrones de Diseño</span>
        <h1>
          Tu cuarto, <em>reimaginado</em> por inteligencia artificial
        </h1>
        <p>
          Sube una foto de tu espacio, elige un estilo y recibe en segundos una propuesta de remodelación con
          ideas concretas de muebles, colores e iluminación.
        </p>
        <div className="hero-actions">
          <a href="#estudio" className="btn btn-primary">Remodelar mi espacio</a>
          <a href="#como-funciona" className="btn btn-ghost">Ver cómo funciona</a>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <SafeImage src={SAMPLE_PHOTO} alt="Dormitorio decorado" className="hero-image" />
        <div className="floating-card">
          <span>✨ Estilo nórdico</span>
          <small>Madera clara · Textiles blancos · Plantas</small>
        </div>
      </div>
    </header>
  );
}
