import { Box, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { DesignStyle, RoomType } from '../../types/catalog';
import type { NewProject } from '../../types/project';

interface NewProjectFormProps {
  roomTypes: RoomType[];
  styles: DesignStyle[];
  busy: boolean;
  onCreate: (data: NewProject) => void;
}

export function NewProjectForm({ roomTypes, styles, busy, onCreate }: NewProjectFormProps) {
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [style, setStyle] = useState('');
  const [furnished, setFurnished] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomType && roomTypes.length) setRoomType(roomTypes[0].slug);
    if (!style && styles.length) setStyle(styles[0].slug);
  }, [roomTypes, styles, roomType, style]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Ponle un nombre a tu proyecto (mínimo 2 letras)');
    setError('');
    onCreate({ name: name.trim(), room_type: roomType, style, furnished });
  }

  return (
    <form className="new-project" onSubmit={submit} noValidate>
      <div className="new-project-head tone-sage">
        <span className="stat-icon">
          <Box size={20} />
        </span>
        <div>
          <h2>Nuevo diseño 3D</h2>
          <p>Elige el espacio y el estilo. Armamos la habitación para que empieces a mover muebles.</p>
        </div>
      </div>

      <label className="field-label" htmlFor="project-name">
        Nombre del proyecto
      </label>
      <input
        id="project-name"
        className="text-input"
        placeholder="Ej. Sala del apartamento"
        value={name}
        maxLength={120}
        onChange={(e) => setName(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="field-error">{error}</small>}

      <span className="field-label">Tipo de habitación</span>
      <div className="chips">
        {roomTypes.map((room) => (
          <button type="button" key={room.slug} className={`chip ${roomType === room.slug ? 'selected' : ''}`} onClick={() => setRoomType(room.slug)}>
            {room.name}
          </button>
        ))}
      </div>

      <span className="field-label">Estilo</span>
      <div className="chips">
        {styles.map((item) => (
          <button type="button" key={item.slug} className={`chip ${style === item.slug ? 'selected' : ''}`} onClick={() => setStyle(item.slug)}>
            {item.name}
          </button>
        ))}
      </div>

      <label className="switch">
        <input type="checkbox" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} />
        <span className="switch-track" aria-hidden="true" />
        Empezar con muebles sugeridos para este espacio
      </label>

      <button className="button button-primary" disabled={busy || !roomType || !style}>
        {busy ? <span className="spinner" /> : <Sparkles size={18} />} Crear y abrir el editor
      </button>
    </form>
  );
}
