import { ImageOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ImageProxyProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

// Proxy: stands in for the real image, loading it only when it enters the screen
// and showing a placeholder until it is ready (or a fallback if it fails).
export function ImageProxy({ src, alt, className = '' }: ImageProxyProps) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    setState('loading');
    const element = holder.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  const failed = !src || state === 'error';

  return (
    <div ref={holder} className={`image-proxy ${state} ${className}`} role={failed ? 'img' : undefined} aria-label={failed ? alt : undefined}>
      {failed ? (
        <ImageOff size={22} aria-hidden="true" />
      ) : (
        visible && (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            decoding="async"
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
          />
        )
      )}
    </div>
  );
}
