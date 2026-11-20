import { useLocation } from 'react-router-dom';
import { config } from '../../config';
import { NAV_ITEMS } from '../../navigation';
import { startAt } from '../../utils/collections';
import { PhotoCarousel } from '../media/PhotoCarousel';

/** Index of the menu section that owns a path, so each section opens on its own photo. */
function sectionIndex(pathname: string): number {
  const match = NAV_ITEMS.map((item, index) => ({ to: item.to, index }))
    .filter(({ to }) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match ? match.index : 0;
}

/** Animated interior photos, light and a fine floor-plan grid behind every page of the app. */
export function AppBackdrop() {
  const { pathname } = useLocation();
  const photos = config.pageBackdropUrls;
  if (photos.length === 0) return null;
  const section = sectionIndex(pathname);

  return (
    <div className="app-backdrop" aria-hidden="true">
      <PhotoCarousel
        key={section}
        photos={startAt(photos, section)}
        className="app-backdrop-photos"
        intervalMs={config.photoIntervalMs * 2}
      />
      <div className="app-backdrop-veil" />
      <div className="app-backdrop-grid" />
      <div className="app-backdrop-lights">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
