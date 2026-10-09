import { useState } from 'react';

export function SafeImage({ src, alt, className }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) {
    return (
      <div className={`image-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <span>🖼️</span>
        <small>No se pudo cargar la imagen</small>
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} />;
}
