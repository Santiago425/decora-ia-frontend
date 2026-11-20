import { Box, Sparkles } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { DesignStyle, RoomType } from '../../types/catalog';
import type { NewProject } from '../../types/project';
import { config } from '../../config';
import { ROOM_LIMITS } from '../../utils/measure';
import { Button, Chip } from '../ui';
import { MeasureInput } from './MeasureInput';
import { SizePresets } from './SizePresets';

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
  const [width, setWidth] = useState<number | null>(null);
  const [length, setLength] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const sizeLabel = useId();
  const [error, setError] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!roomType && roomTypes.length) setRoomType(roomTypes[0].slug);
    if (!style && styles.length) setStyle(styles[0].slug);
  }, [roomTypes, styles, roomType, style]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Ponle un nombre a tu proyecto (mínimo 2 letras)');
      // The button sits far below the field, so bring the field back into view.
      nameInput.current?.focus();
      return;
    }
    setError('');
    onCreate({
      name: name.trim(),
      room_type: roomType,
      style,
      furnished,
      ...(width !== null && { width }),
      ...(length !== null && { length }),
      ...(height !== null && { height }),
    });
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
        ref={nameInput}
        id="project-name"
        className="text-input"
        placeholder="Ej. Sala del apartamento"
        value={name}
        maxLength={120}
        onChange={(e) => setName(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'project-name-error' : undefined}
      />
      {error && (
        <small className="field-error" id="project-name-error" role="alert">
          {error}
        </small>
      )}

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

      <span className="field-label" id={sizeLabel}>
        Medidas del cuarto <small>(opcional)</small>
      </span>
      <div className="room-size" role="group" aria-labelledby={sizeLabel}>
        <SizePresets
          presets={config.editor.roomSizePresets}
          current={width !== null && length !== null ? [width, length] : null}
          onPick={([w, l]) => {
            setWidth(w);
            setLength(l);
          }}
        />
        <div className="dimension-row">
          <MeasureInput
            label="Ancho"
            value={width}
            range={ROOM_LIMITS.width}
            placeholder="Auto"
            optional
            onCommit={setWidth}
          />
          <MeasureInput
            label="Largo"
            value={length}
            range={ROOM_LIMITS.length}
            placeholder="Auto"
            optional
            onCommit={setLength}
          />
          <MeasureInput
            label="Alto"
            value={height}
            range={ROOM_LIMITS.height}
            placeholder="Auto"
            optional
            onCommit={setHeight}
          />
        </div>
        <small className="field-hint">
          Si dejas un campo vacío usamos la medida estándar. Puedes cambiarlas después en el editor.
        </small>
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
