import { SAMPLE_PHOTO } from '../data/catalog.js';
import { SafeImage } from './SafeImage.jsx';

export function Hero() {
  return (
    <header className="hero" id="inicio">
      <SafeImage src={SAMPLE_PHOTO} alt="" className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="kicker">Diseño de interiores con inteligencia artificial</span>
        <h1>
          Tu espacio,<br /><em>reimaginado.</em>
        </h1>
        <p>
          Sube una foto de tu cuarto, elige un estilo y recibe una propuesta de remodelación con ideas
          concretas de mobiliario, color e iluminación.
        </p>
        <div className="hero-actions">
          <a href="#estudio" className="btn btn-primary">Comenzar</a>
          <a href="#como-funciona" className="btn btn-ghost">Cómo funciona</a>
        </div>
      </div>
      <div className="hero-foot">
        <span>Proyecto final · Patrones de Diseño</span>
        <span>Cinco estilos · Seis tipos de espacio</span>
      </div>
    </header>
  );
}
