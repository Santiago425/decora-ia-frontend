import { ArrowRight, Box, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { EmptyIllustration } from '../EmptyState';
import { ButtonLink } from '../ui';

// Two independent ways to start: a photo redesign or a room built from scratch in 3D.
const PATHS = [
  {
    to: '/redesign',
    Icon: Camera,
    title: 'Rediseñar con IA',
    text: 'Sube una foto de tu sala, cuarto o cocina, elige un estilo y compara el antes y el después.',
  },
  {
    to: '/editor',
    Icon: Box,
    title: 'Diseñar en 3D',
    text: 'Arma una habitación desde cero, mueve los muebles, cambia colores y mira el presupuesto.',
  },
];

export function GettingStarted() {
  return (
    <section className="getting-started" aria-labelledby="getting-started-title">
      <div className="getting-started-intro">
        <EmptyIllustration />
        <div>
          <span className="getting-started-kicker">Primeros pasos</span>
          <h2 id="getting-started-title">Dos formas de empezar</h2>
          <p>Aún no tienes proyectos. Elige cómo quieres diseñar o pídele ideas a {config.assistantName}.</p>
        </div>
        <ButtonLink to="/redesign">
          Empezar ahora <ArrowRight size={18} />
        </ButtonLink>
      </div>
      <ul className="getting-started-steps">
        {PATHS.map(({ to, Icon, title, text }) => (
          <li key={title}>
            <Link to={to} className="getting-started-step">
              <span className="step-number" aria-hidden="true">
                <Icon size={20} />
              </span>
              <strong>{title}</strong>
              <small>{text}</small>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
