import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config } from '../../config';
import { preloadHandlers } from '../../routes/pages';
import { PhotoCarousel } from '../media/PhotoCarousel';

const TARGET = '/redesign';

/** Photo card at the foot of the menu that invites to redesign a room. */
export function SidebarSpotlight() {
  if (config.sidebarPhotoUrls.length === 0) return null;
  return (
    <Link to={TARGET} className="sidebar-spotlight" {...preloadHandlers(TARGET)}>
      <PhotoCarousel photos={config.sidebarPhotoUrls} className="sidebar-spotlight-photo" sizes="240px" />
      <span className="sidebar-spotlight-badge">
        <Sparkles size={12} aria-hidden="true" /> Con IA
      </span>
      <span className="sidebar-spotlight-text">
        <strong>Rediseña tu espacio</strong>
        <small>Sube una foto y elige un estilo</small>
      </span>
      <span className="sidebar-spotlight-cta" aria-hidden="true">
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}
