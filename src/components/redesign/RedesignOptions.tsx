import { config } from '../../config';
import type { DesignStyle } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { ImageProxy } from '../ImageProxy';
import { FlipCard } from '../motion';
import { MaterialSwatch } from './MaterialSwatch';

export interface RedesignChoices {
  style: string;
  paletteId: number | null;
  budget: string;
  keepStructure: boolean;
}

interface Props {
  styles: DesignStyle[];
  value: RedesignChoices;
  onChange: (changes: Partial<RedesignChoices>) => void;
}

export function RedesignOptions({ styles, value, onChange }: Props) {
  const palettes = styles.find((s) => s.slug === value.style)?.palettes ?? [];

  function selectStyle(slug: string) {
    const first = styles.find((s) => s.slug === slug)?.palettes[0];
    onChange({ style: slug, paletteId: first?.id ?? null });
  }

  return (
    <>
      <fieldset>
        <legend>Estilo</legend>
        <div className="style-options">
          {styles.map((item) => {
            const selected = value.style === item.slug;
            return (
              <FlipCard
                key={item.slug}
                className={`style-option ${selected ? 'selected' : ''}`}
                flipLabel={`Ver paleta y materiales del estilo ${item.name}`}
                front={
                  <button
                    type="button"
                    className="style-face"
                    aria-pressed={selected}
                    onClick={() => selectStyle(item.slug)}
                  >
                    <ImageProxy src={item.image_url} alt={`Ambiente de estilo ${item.name}`} />
                    <span className="style-face-name">{item.name}</span>
                  </button>
                }
                back={
                  <button
                    type="button"
                    className="style-face style-face-back"
                    tabIndex={-1}
                    onClick={() => selectStyle(item.slug)}
                  >
                    <strong>{item.name}</strong>
                    <span className="style-back-palette">
                      {item.palettes[0]?.colors.map((color) => (
                        <i key={color} style={{ background: color }} />
                      ))}
                    </span>
                    <span className="style-back-materials">
                      {item.materials.slice(0, 3).map((material) => (
                        <MaterialSwatch key={material.slug} material={material} />
                      ))}
                    </span>
                  </button>
                }
              />
            );
          })}
        </div>
      </fieldset>

      {palettes.length > 0 && (
        <fieldset>
          <legend>Paleta de colores</legend>
          <div className="palette-options">
            {palettes.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`palette-option ${value.paletteId === option.id ? 'selected' : ''}`}
                aria-pressed={value.paletteId === option.id}
                onClick={() => onChange({ paletteId: value.paletteId === option.id ? null : option.id })}
              >
                <span className="palette-dots">
                  {option.colors.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </span>
                {option.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="option-row">
        <label className="budget-field">
          <span>Presupuesto ({config.currency})</span>
          <input
            inputMode="numeric"
            placeholder="Opcional"
            value={value.budget ? formatCurrency(Number(value.budget)) : ''}
            onChange={(e) => onChange({ budget: e.target.value.replace(/\D/g, '').slice(0, 12) })}
          />
        </label>
        <label className="switch">
          <input
            type="checkbox"
            checked={value.keepStructure}
            onChange={(e) => onChange({ keepStructure: e.target.checked })}
          />
          <span className="switch-track" />
          <span>Conservar paredes, ventanas y piso</span>
        </label>
      </div>
    </>
  );
}
