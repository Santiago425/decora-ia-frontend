import { useEffect, useState } from 'react';
import { SAMPLE_PHOTO, STYLES } from '../data/catalog.js';
import { SafeImage } from './SafeImage.jsx';

const ROTATING = Object.values(STYLES).map((s) => s.label);

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="hero" id="inicio">
      <SafeImage src={SAMPLE_PHOTO} alt="" className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-glow" />
      <div className="hero-content">
        <span className="kicker reveal" style={{ '--d': '2.4s' }}>Diseño de interiores con inteligencia artificial</span>
        <h1>
          <span className="reveal-line"><span style={{ '--d': '2.55s' }}>Tu espacio,</span></span>
          <span className="reveal-line"><em className="shine" style={{ '--d': '2.75s' }}>reimaginado.</em></span>
        </h1>
        <p className="hero-rotator reveal" style={{ '--d': '3s' }}>
          En estilo{' '}
          <span className="rotator" key={index}>{ROTATING[index]}</span>
        </p>
        <p className="hero-lead reveal" style={{ '--d': '3.15s' }}>
          Sube una foto de tu cuarto, elige un estilo y recibe una propuesta de remodelación con ideas
          concretas de mobiliario, color e iluminación.
        </p>
        <div className="hero-actions reveal" style={{ '--d': '3.3s' }}>
          <a href="#estudio" className="btn btn-primary btn-shimmer">Diseñar mi espacio</a>
          <a href="#estilos" className="btn btn-ghost">Explorar estilos</a>
        </div>
      </div>
      <div className="hero-foot reveal" style={{ '--d': '3.5s' }}>
        <span><strong>5</strong> estilos</span>
        <span><strong>6</strong> tipos de espacio</span>
        <span><strong>IA</strong> en segundos</span>
      </div>
      <a href="#estilos" className="scroll-cue" aria-label="Bajar">
        <span />
      </a>
    </header>
  );
}
