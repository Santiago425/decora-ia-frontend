import { Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { RoomComposite } from '../../editor/composite';
import type { DesignStyle, Material } from '../../types/catalog';
import type { LightingData, RoomData } from '../../types/project';
import { formatCurrency } from '../../utils/format';

interface RoomPanelProps {
  composite: RoomComposite;
  styles: DesignStyle[];
  materials: Material[];
  disabled: boolean;
  onStyle: (slug: string) => void;
  onRoom: (room: RoomData, label: string) => void;
  onLighting: (lighting: LightingData) => void;
}

const LIMITS = { width: [1.5, 20], length: [1.5, 20], height: [2, 5] } as const;
type Dimension = keyof typeof LIMITS;
const LABELS: Record<Dimension, string> = { width: 'Ancho', length: 'Largo', height: 'Alto' };

function DimensionInput({ field, room, disabled, onRoom }: { field: Dimension; room: RoomData; disabled: boolean; onRoom: RoomPanelProps['onRoom'] }) {
  const [value, setValue] = useState(String(room[field]));
  useEffect(() => setValue(String(room[field])), [room, field]);
  const [min, max] = LIMITS[field];

  function commit() {
    const number = Math.min(max, Math.max(min, Number(value.replace(',', '.'))));
    if (Number.isNaN(number)) return setValue(String(room[field]));
    setValue(String(number));
    if (number !== room[field]) onRoom({ ...room, [field]: number }, 'Cambiar medidas');
  }

  return (
    <label className="dimension">
      <span>{LABELS[field]}</span>
      <input
        type="number"
        inputMode="decimal"
        step={0.1}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
      <em>m</em>
    </label>
  );
}

function MaterialPicker({ title, surface, room, materials, disabled, onRoom }: {
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
              onClick={() => onRoom({ ...room, [key]: material.slug }, surface === 'wall' ? 'Cambiar paredes' : 'Cambiar piso')}
              title={`${material.name} · ${formatCurrency(material.price_per_unit)} por m²`}
            >
              <span className="material-swatch" style={{ background: material.color_hex }} />
              <span>{material.name}</span>
            </button>
          ))}
      </div>
    </section>
  );
}

export function RoomPanel({ composite, styles, materials, disabled, onStyle, onRoom, onLighting }: RoomPanelProps) {
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
            <button key={item.slug} className="theme-option" aria-pressed={style === item.slug} disabled={disabled} onClick={() => onStyle(item.slug)}>
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
        <div className="dimension-row">
          {(Object.keys(LIMITS) as Dimension[]).map((field) => (
            <DimensionInput key={field} field={field} room={room} disabled={disabled} onRoom={onRoom} />
          ))}
        </div>
      </section>

      <MaterialPicker title="Paredes" surface="wall" room={room} materials={materials} disabled={disabled} onRoom={onRoom} />
      <MaterialPicker title="Piso" surface="floor" room={room} materials={materials} disabled={disabled} onRoom={onRoom} />

      <section className="inspector-section">
        <h4>Iluminación</h4>
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
