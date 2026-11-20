import { ArrowUpRight, Box, Camera, Images, Sparkles } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../config';

const ACTIONS = [
  {
    to: '/redesign',
    title: 'Rediseñar con IA',
    hint: 'Transforma una foto de tu espacio',
    icon: Camera,
    tone: 'terracotta',
  },
  { to: '/editor', title: 'Diseñar en 3D', hint: 'Arma tu espacio desde cero', icon: Box, tone: 'sage' },
  {
    to: '#inspiracion',
    title: 'Usar inspiración',
    hint: 'Elige una foto y copia su estilo',
    icon: Images,
    tone: 'wood',
  },
  {
    to: '/assistant',
    title: `Hablar con ${config.assistantName}`,
    hint: 'Por voz o texto',
    icon: Sparkles,
    tone: 'ink',
  },
];

/** Scrolls to a section of the same page instead of navigating away. */
function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, to: string) {
  if (!to.startsWith('#')) return;
  const target = document.getElementById(to.slice(1));
  if (!target) return;
  event.preventDefault();
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

export function QuickActions() {
  return (
    <div className="quick-actions">
      {ACTIONS.map(({ to, title, hint, icon: Icon, tone }, index) => (
        <Link
          key={to}
          to={to}
          onClick={(event) => scrollToAnchor(event, to)}
          className={`quick-action tone-${tone}`}
          style={{ animationDelay: `${120 + index * 70}ms` }}
        >
          <span className="quick-icon">
            <Icon size={22} />
          </span>
          <span className="quick-text">
            <strong>{title}</strong>
            <small>{hint}</small>
          </span>
          <ArrowUpRight size={18} className="quick-arrow" />
        </Link>
      ))}
    </div>
  );
}
