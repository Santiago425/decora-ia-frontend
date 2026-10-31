import { Camera, ImagePlus, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { isAcceptedImage } from '../../utils/image';

interface PhotoPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  onInvalid: (message: string) => void;
}

export function PhotoPicker({ file, onChange, onInvalid }: PhotoPickerProps) {
  const uploadInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!isAcceptedImage(candidate)) {
      onInvalid('Sube una foto en formato JPG, PNG o WEBP');
      return;
    }
    onChange(candidate);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  }

  const inputs = (
    <>
      <input ref={uploadInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => accept(e.target.files?.[0])} />
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => accept(e.target.files?.[0])} />
    </>
  );

  if (preview) {
    return (
      <div className="photo-preview">
        <img src={preview} alt="Foto de tu espacio" />
        <button type="button" className="button button-glass" onClick={() => uploadInput.current?.click()}>
          <RefreshCcw size={16} /> Cambiar foto
        </button>
        {inputs}
      </div>
    );
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <span className="dropzone-icon">
        <ImagePlus size={30} />
      </span>
      <strong>Arrastra aquí la foto de tu espacio</strong>
      <small>JPG, PNG o WEBP</small>
      <div className="dropzone-actions">
        <button type="button" className="button button-primary" onClick={() => uploadInput.current?.click()}>
          <ImagePlus size={18} /> Subir foto
        </button>
        <button type="button" className="button button-ghost camera-button" onClick={() => cameraInput.current?.click()}>
          <Camera size={18} /> Tomar foto
        </button>
      </div>
      {inputs}
    </div>
  );
}
