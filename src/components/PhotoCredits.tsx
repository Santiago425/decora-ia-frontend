import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { config } from '../config';
import { catalogService } from '../services/catalogService';
import type { InspirationPhoto } from '../types/catalog';

export function PhotoCredits({ className = 'credits-button' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<InspirationPhoto[] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  useEffect(() => {
    if (!open || photos) return;
    catalogService
      .inspiration()
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, [open, photos]);

  if (!config.photoCredits.name) return null;
  const authors = [...new Map((photos ?? []).map((photo) => [photo.author_name, photo])).values()];

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <Camera size={14} /> Créditos
      </button>
      <dialog ref={dialog} className="credits-dialog" onClose={() => setOpen(false)}>
        <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar">
          <X size={18} />
        </button>
        <h2>Créditos de fotografía</h2>
        <p>
          Las fotografías de interiores provienen de{' '}
          <a href={config.photoCredits.url} target="_blank" rel="noreferrer noopener">
            {config.photoCredits.name}
          </a>{' '}
          y se usan bajo su licencia libre.
        </p>
        {authors.length > 0 && (
          <ul className="credits-list">
            {authors.map((photo) => (
              <li key={photo.author_name}>
                {photo.source_url ? (
                  <a href={photo.source_url} target="_blank" rel="noreferrer noopener">
                    {photo.author_name}
                  </a>
                ) : (
                  photo.author_name
                )}
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </>
  );
}
