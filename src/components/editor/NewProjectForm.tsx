import { Box, Sparkles } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import type { DesignStyle, RoomType } from '../../types/catalog';
import type { NewProject } from '../../types/project';
import { Button, Chip } from '../ui';

interface NewProjectFormProps {
  roomTypes: RoomType[];
  styles: DesignStyle[];
  busy: boolean;
  onCreate: (data: NewProject) => void;
}

export function NewProjectForm({ roomTypes, styles, busy, onCreate }: NewProjectFormProps) {
  const [name, setName] = useState('');
  const roomLabel = useId();
  const styleLabel = useId();
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

      <span className="field-label" id={roomLabel}>
        Tipo de habitación
      </span>
      <div className="chips" role="group" aria-labelledby={roomLabel}>
        {roomTypes.map((room) => (
          <Chip key={room.slug} selected={roomType === room.slug} onClick={() => setRoomType(room.slug)}>
            {room.name}
          </Chip>
        ))}
      </div>

      <span className="field-label" id={styleLabel}>
        Estilo
      </span>
      <div className="chips" role="group" aria-labelledby={styleLabel}>
        {styles.map((item) => (
          <Chip key={item.slug} selected={style === item.slug} onClick={() => setStyle(item.slug)}>
            {item.name}
          </Chip>
        ))}
      </div>

      <label className="switch">
        <input type="checkbox" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} />
        <span className="switch-track" aria-hidden="true" />
        Empezar con muebles sugeridos para este espacio
      </label>

      <Button type="submit" disabled={busy || !roomType || !style}>
        {busy ? <span className="spinner" /> : <Sparkles size={18} />} Crear y abrir el editor
      </Button>
    </form>
  );
}
