import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { config } from '../config';

export function PhotoCredits() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  if (!config.photoCredits.name) return null;

  return (
    <>
      <button type="button" className="credits-button" onClick={() => setOpen(true)}>
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
      </dialog>
    </>
  );
}
