import { ArrowRight, Box, Camera, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { EmptyIllustration } from '../EmptyState';
import { ButtonLink } from '../ui';

const STEPS = [
  {
    to: '/redesign',
    Icon: Camera,
    title: 'Sube una foto',
    text: 'De tu sala, cuarto o cocina. También sirve una de ejemplo.',
  },
  {
    to: '/redesign',
    Icon: Sparkles,
    title: 'Elige un estilo',
    text: 'Nórdico, industrial, boho… y compara el antes y el después.',
  },
  { to: '/editor', Icon: Box, title: 'Ajusta en 3D', text: 'Mueve los muebles, cambia colores y mira el presupuesto.' },
];

export function GettingStarted() {
  return (
    <section className="getting-started" aria-labelledby="getting-started-title">
      <div className="getting-started-intro">
        <EmptyIllustration />
        <div>
          <span className="getting-started-kicker">Primeros pasos</span>
          <h2 id="getting-started-title">Tu primer proyecto en 3 pasos</h2>
          <p>Aún no tienes proyectos. Empieza con una foto o pídele ideas a {config.assistantName}.</p>
        </div>
        <ButtonLink to="/redesign">
          Empezar ahora <ArrowRight size={18} />
        </ButtonLink>
      </div>
      <ol className="getting-started-steps">
        {STEPS.map(({ to, Icon, title, text }, index) => (
          <li key={title}>
            <Link to={to} className="getting-started-step">
              <span className="step-number" aria-hidden="true">
                {index + 1}
              </span>
              <Icon size={20} className="step-icon" aria-hidden="true" />
              <strong>{title}</strong>
              <small>{text}</small>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
