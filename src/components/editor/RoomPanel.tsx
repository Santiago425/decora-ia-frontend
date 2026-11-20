import { Lightbulb, Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { RoomComposite } from '../../editor/composite';
import type { DaylightPreset, DesignStyle, Material } from '../../types/catalog';
import type { LightingData, RoomData } from '../../types/project';
import { config } from '../../config';
import { formatCurrency } from '../../utils/format';
import { ROOM_LIMITS } from '../../utils/measure';
import { MeasureInput } from './MeasureInput';
import { SizePresets } from './SizePresets';

interface RoomPanelProps {
  composite: RoomComposite;
  styles: DesignStyle[];
  materials: Material[];
  daylight?: DaylightPreset[];
  disabled: boolean;
  onStyle: (slug: string) => void;
  onRoom: (room: RoomData, label: string) => void;
  onLighting: (lighting: LightingData) => void;
}

type Dimension = keyof typeof ROOM_LIMITS;
const LABELS: Record<Dimension, string> = { width: 'Ancho', length: 'Largo', height: 'Alto' };

function MaterialPicker({
  title,
  surface,
  room,
  materials,
  disabled,
  onRoom,
}: {
  title: string;
  surface: 'wall' | 'floor';
  room: RoomData;
  materials: Material[];
  disabled: boolean;
  onRoom: RoomPanelProps['onRoom'];
}) {
  const key = surface === 'wall' ? 'wall_material' : 'floor_material';
  return (
    <section className="inspector-section">
      <h4>{title}</h4>
      <div className="material-grid">
        {materials
          .filter((material) => material.surface === surface)
          .map((material) => (
            <button
              key={material.slug}
              className="material"
              aria-pressed={room[key] === material.slug}
              disabled={disabled}
              onClick={() =>
                onRoom({ ...room, [key]: material.slug }, surface === 'wall' ? 'Cambiar paredes' : 'Cambiar piso')
              }
              title={`${material.name} · ${formatCurrency(material.price_per_unit)} por m²`}
            >
              <span className="material-swatch" style={{ background: material.color_hex }}>
                {material.texture_url && (
                  <img
                    src={material.texture_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(event) => (event.currentTarget.hidden = true)}
                  />
                )}
              </span>
              <span>{material.name}</span>
            </button>
          ))}
      </div>
    </section>
  );
}

const TIME_ICONS: Record<string, LucideIcon> = { morning: Sunrise, afternoon: Sunset, night: Moon };

/** Times of day come from the catalog; "Estudio" keeps the even light the editor had before. */
function TimeOfDay({
  presets,
  lighting,
  disabled,
  onLighting,
}: {
  presets: DaylightPreset[];
  lighting: LightingData;
  disabled: boolean;
  onLighting: RoomPanelProps['onLighting'];
}) {
  const current = lighting.time_of_day ?? null;
  const pick = (slug: string | null) => slug !== current && onLighting({ ...lighting, time_of_day: slug });
  const options = [
    { slug: null, name: 'Estudio', description: 'Luz pareja, sin sol', Icon: Lightbulb },
    ...presets.map((preset) => ({
      slug: preset.slug,
      name: preset.name,
      description: preset.description,
      Icon: TIME_ICONS[preset.slug] ?? Sun,
    })),
  ];
  return (
    <div className="time-of-day">
      <span>Hora del día</span>
      <div className="time-grid">
        {options.map(({ slug, name, description, Icon }) => (
          <button
            key={slug ?? 'studio'}
            className="time-option"
            aria-pressed={current === slug}
            disabled={disabled}
            title={description}
            onClick={() => pick(slug)}
          >
            <Icon size={16} aria-hidden="true" />
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Light tones come from each style's lighting color in the catalog, plus a free picker. */
function LightTones({
  styles,
  lighting,
  disabled,
  onLighting,
}: {
  styles: DesignStyle[];
  lighting: LightingData;
  disabled: boolean;
  onLighting: RoomPanelProps['onLighting'];
}) {
  const tones = new Map<string, string>();
  for (const style of styles) {
    const color = style.lighting_color.toLowerCase();
    if (!tones.has(color)) tones.set(color, style.name);
  }
  const current = lighting.color.toLowerCase();
  const pick = (color: string) => color.toLowerCase() !== current && onLighting({ ...lighting, color });

  return (
    <div className="light-tones">
      <span>Tono de la luz</span>
      <div className="swatch-row">
        {[...tones].map(([color, name]) => (
          <button
            key={color}
            className="swatch"
            style={{ background: color }}
            title={`Luz ${name}`}
            aria-label={`Luz ${name}`}
            aria-pressed={current === color}
            disabled={disabled}
            onClick={() => pick(color)}
          />
        ))}
        <label className="swatch swatch-picker" title="Elegir otro tono">
          <span className="sr-only">Elegir otro tono de luz</span>
          <input type="color" value={lighting.color} disabled={disabled} onChange={(e) => pick(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export function RoomPanel({
  composite,
  styles,
  materials,
  daylight = [],
  disabled,
  onStyle,
  onRoom,
  onLighting,
}: RoomPanelProps) {
  const { room, lighting, style } = composite.scene;
  const surfaces = composite.surfaces();
  const [intensity, setIntensity] = useState(lighting.intensity);
  useEffect(() => setIntensity(lighting.intensity), [lighting.intensity]);

  return (
    <div className="inspector">
      <header className="inspector-head plain">
        <div>
          <h3>Tu habitación</h3>
          <small>Toca un mueble para editarlo, o cambia aquí el espacio completo.</small>
        </div>
      </header>

      <section className="inspector-section">
        <h4>Estilo</h4>
        <div className="theme-grid">
          {styles.map((item) => (
            <button
              key={item.slug}
              className="theme-option"
              aria-pressed={style === item.slug}
              disabled={disabled}
              onClick={() => onStyle(item.slug)}
            >
              <span className="theme-colors">
                {(item.palettes[0]?.colors ?? []).slice(0, 4).map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section className="inspector-section">
        <h4>Medidas</h4>
        <SizePresets
          presets={config.editor.roomSizePresets}
          current={[room.width, room.length]}
          disabled={disabled}
          onPick={([width, length]) => onRoom({ ...room, width, length }, 'Cambiar medidas')}
        />
        <div className="dimension-row">
          {(Object.keys(ROOM_LIMITS) as Dimension[]).map((field) => (
            <MeasureInput
              key={field}
              label={LABELS[field]}
              value={room[field]}
              range={ROOM_LIMITS[field]}
              disabled={disabled}
              onCommit={(value) => value !== null && onRoom({ ...room, [field]: value }, 'Cambiar medidas')}
            />
          ))}
        </div>
      </section>

      <MaterialPicker
        title="Paredes"
        surface="wall"
        room={room}
        materials={materials}
        disabled={disabled}
        onRoom={onRoom}
      />
      <MaterialPicker
        title="Piso"
        surface="floor"
        room={room}
        materials={materials}
        disabled={disabled}
        onRoom={onRoom}
      />

      <section className="inspector-section">
        <h4>Iluminación</h4>
        {daylight.length > 0 && (
          <TimeOfDay presets={daylight} lighting={lighting} disabled={disabled} onLighting={onLighting} />
        )}
        <label className="light-slider">
          <Sun size={16} aria-hidden="true" />
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.05}
            value={intensity}
            disabled={disabled}
            aria-label="Intensidad de la luz"
            onChange={(e) => setIntensity(Number(e.target.value))}
            onPointerUp={() => intensity !== lighting.intensity && onLighting({ ...lighting, intensity })}
            onKeyUp={() => intensity !== lighting.intensity && onLighting({ ...lighting, intensity })}
          />
          <span>{Math.round(intensity * 100)}%</span>
        </label>
        <LightTones styles={styles} lighting={lighting} disabled={disabled} onLighting={onLighting} />
      </section>

      <section className="inspector-section budget-breakdown">
        <h4>Presupuesto</h4>
        <dl>
          <div>
            <dt>Muebles ({composite.itemCount()})</dt>
            <dd>{formatCurrency(composite.furniturePrice())}</dd>
          </div>
          <div>
            <dt>Piso · {surfaces.floorArea.toFixed(1)} m²</dt>
            <dd>{formatCurrency(surfaces.floor)}</dd>
          </div>
          <div>
            <dt>Paredes · {surfaces.wallArea.toFixed(1)} m²</dt>
            <dd>{formatCurrency(surfaces.walls)}</dd>
          </div>
          <div className="total">
            <dt>Total estimado</dt>
            <dd>{formatCurrency(composite.price())}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
