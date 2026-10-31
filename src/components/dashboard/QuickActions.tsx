import { ArrowUpRight, Box, Camera, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config } from '../../config';

const ACTIONS = [
  { to: '/redesign', title: 'Nuevo rediseño con foto', hint: 'Sube o toma una foto', icon: Camera, tone: 'terracotta' },
  { to: '/editor', title: 'Abrir editor 3D', hint: 'Arma tu espacio', icon: Box, tone: 'sage' },
  { to: '/assistant', title: `Hablar con ${config.assistantName}`, hint: 'Por voz o texto', icon: Sparkles, tone: 'ink' },
];

export function QuickActions() {
  return (
    <div className="quick-actions">
      {ACTIONS.map(({ to, title, hint, icon: Icon, tone }, index) => (
        <Link key={to} to={to} className={`quick-action tone-${tone}`} style={{ animationDelay: `${120 + index * 70}ms` }}>
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
