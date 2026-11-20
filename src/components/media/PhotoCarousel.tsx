import { useEffect, useState } from 'react';
import { config } from '../../config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PhotoCarouselProps {
  photos: string[];
  className?: string;
  intervalMs?: number;
}

/** Decorative photos that cross-fade in place; with reduced motion only the first one is shown. */
export function PhotoCarousel({ photos, className = '', intervalMs = config.photoIntervalMs }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const still = useReducedMotion();

  useEffect(() => {
    if (still || photos.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % photos.length), intervalMs);
    return () => window.clearInterval(timer);
  }, [photos.length, intervalMs, still]);

  if (photos.length === 0) return null;
  const visible = new Set([index, (index + 1) % photos.length]);

  return (
    <div className={`photo-carousel ${className}`} aria-hidden="true">
      {photos.map((src, position) =>
        visible.has(position) || loaded.has(position) ? (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            loading={position === 0 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            className={`${position === index ? 'active' : ''} ${loaded.has(position) ? 'loaded' : ''}`}
            onLoad={() => setLoaded((current) => new Set(current).add(position))}
          />
        ) : null,
      )}
    </div>
  );
}
