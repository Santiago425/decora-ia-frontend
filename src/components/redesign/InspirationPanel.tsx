import { ImagePlus, RefreshCcw, WandSparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { isAcceptedImage } from '../../utils/image';
import { Button } from '../ui';

interface Props {
  alert: ReactNode;
  onApply: (photo: File) => void;
  onInvalid: (message: string) => void;
  onClose: () => void;
}

export function InspirationPanel({ alert, onApply, onInvalid, onClose }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!isAcceptedImage(candidate)) return onInvalid('Sube una foto en formato JPG, PNG o WEBP');
    onInvalid('');
    setPhoto(candidate);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (photo) onApply(photo);
  }

  return (
    <form className="redesign-tuning inspiration-panel" onSubmit={handleSubmit}>
      <header>
        <div>
          <h2>Estilo desde una foto</h2>
          <p>
            Sube una foto de un espacio que te guste. Leemos su estilo, colores y materiales y los aplicamos a tu foto.
            Se guarda como versión nueva.
          </p>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
      </header>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        data-testid="inspiration-input"
        onChange={(event) => accept(event.target.files?.[0])}
      />

      {preview ? (
        <div className="inspiration-preview">
          <img src={preview} alt="Foto de inspiración" />
          <Button variant="glass" type="button" className="photo-change" onClick={() => input.current?.click()}>
            <RefreshCcw size={16} /> Cambiar foto
          </Button>
        </div>
      ) : (
        <button type="button" className="inspiration-drop" onClick={() => input.current?.click()}>
          <ImagePlus size={26} />
          <strong>Elegir foto de inspiración</strong>
          <small>JPG, PNG o WEBP</small>
        </button>
      )}

      {alert}
      <Button type="submit" size="lg" block disabled={!photo}>
        <WandSparkles size={20} /> Aplicar este estilo
      </Button>
    </form>
  );
}
