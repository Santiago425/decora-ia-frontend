import { config } from '../../config';
import type { DesignStyle } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { ImageProxy } from '../ImageProxy';

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
          {styles.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={`style-option ${value.style === item.slug ? 'selected' : ''}`}
              aria-pressed={value.style === item.slug}
              onClick={() => selectStyle(item.slug)}
            >
              <ImageProxy src={item.image_url} alt="" />
              <span>{item.name}</span>
            </button>
          ))}
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
