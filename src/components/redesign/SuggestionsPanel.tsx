import { Armchair, Check, Copy, Lamp, Layers, Palette } from 'lucide-react';
import { useState } from 'react';
import type { DesignSuggestions, SuggestedItem } from '../../types/redesign';
import { formatCurrency } from '../../utils/format';

function ItemList({ items }: { items: SuggestedItem[] }) {
  return (
    <ul className="suggestion-items">
      {items.map((item) => (
        <li key={item.name}>
          <div>
            <strong>{item.name}</strong>
            {item.description && <small>{item.description}</small>}
          </div>
          {item.price > 0 && <span>{formatCurrency(item.price)}</span>}
        </li>
      ))}
    </ul>
  );
}

export function SuggestionsPanel({ suggestions, total }: { suggestions: DesignSuggestions; total: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(hex: string) {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopied(hex);
    setTimeout(() => setCopied(null), 1400);
  }

  const groups = [
    { key: 'furniture', title: 'Muebles recomendados', icon: Armchair, items: suggestions.furniture ?? [] },
    { key: 'materials', title: 'Materiales', icon: Layers, items: suggestions.materials ?? [] },
    { key: 'lighting', title: 'Iluminación', icon: Lamp, items: suggestions.lighting ?? [] },
  ].filter((group) => group.items.length);

  return (
    <div className="suggestions">
      {suggestions.summary && <p className="suggestions-summary">{suggestions.summary}</p>}

      {suggestions.colors?.length ? (
        <section className="suggestion-group">
          <h3>
            <Palette size={18} /> Colores
          </h3>
          <div className="color-chips">
            {suggestions.colors.map((color) => (
              <button key={color.hex + color.name} type="button" className="color-chip" onClick={() => copy(color.hex)}>
                <span className="color-swatch" style={{ background: color.hex }} />
                <span>
                  <strong>{color.name}</strong>
                  <small>
                    {copied === color.hex ? <Check size={12} /> : <Copy size={12} />} {color.hex.toUpperCase()}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {groups.map(({ key, title, icon: Icon, items }) => (
        <section key={key} className="suggestion-group">
          <h3>
            <Icon size={18} /> {title}
          </h3>
          <ItemList items={items} />
        </section>
      ))}

      {Number(total) > 0 && (
        <div className="suggestions-total">
          <span>Presupuesto aproximado</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      )}
    </div>
  );
}
