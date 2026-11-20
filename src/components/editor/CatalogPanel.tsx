import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { config } from '../../config';
import type { FurnitureCategory, FurnitureItem } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { FurnitureThumb } from './FurnitureThumb';
import { Tabs } from '../ui';

interface CatalogPanelProps {
  categories: FurnitureCategory[];
  furniture: FurnitureItem[];
  roomType: string | null;
  roomName: string | null;
  disabled: boolean;
  onAdd: (item: FurnitureItem) => void;
}

const SUGGESTED = '__suggested';
const ALL = '__all';
const meters = (value: number) => value.toLocaleString(config.locale, { maximumFractionDigits: 2 });

export function CatalogPanel({ categories, furniture, roomType, roomName, disabled, onAdd }: CatalogPanelProps) {
  const [filter, setFilter] = useState(roomType ? SUGGESTED : ALL);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return furniture.filter((item) => {
      if (text && !`${item.name} ${item.category.name}`.toLowerCase().includes(text)) return false;
      if (filter === SUGGESTED) return roomType ? item.category.room_types.includes(roomType) : true;
      if (filter === ALL) return true;
      return item.category.slug === filter;
    });
  }, [furniture, filter, query, roomType]);

  return (
    <div className="catalog-panel">
      <label className="catalog-search">
        <Search size={16} aria-hidden="true" />
        <input type="search" placeholder="Buscar muebles" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <Tabs
        className="chip-row"
        label="Categorías"
        variant="chips"
        value={filter}
        onChange={setFilter}
        items={[
          ...(roomType ? [{ value: SUGGESTED, label: `Para ${roomName?.toLowerCase() ?? 'tu espacio'}` }] : []),
          { value: ALL, label: 'Todos' },
          ...categories.map((category) => ({ value: category.slug, label: category.name })),
        ]}
      />
      <ul className="catalog-list">
        {visible.map((item) => (
          <li key={item.id}>
            <button
              className="catalog-item"
              onClick={() => onAdd(item)}
              disabled={disabled}
              title={`Agregar ${item.name}`}
            >
              <span className="catalog-thumb">
                <FurnitureThumb item={item} />
              </span>
              <span className="catalog-text">
                <strong>{item.name}</strong>
                <small>
                  {meters(item.width)} × {meters(item.depth)} m · {formatCurrency(item.price)}
                </small>
              </span>
              <Plus size={18} className="catalog-add" aria-hidden="true" />
            </button>
          </li>
        ))}
        {!visible.length && <li className="panel-empty">No hay muebles con ese filtro.</li>}
      </ul>
    </div>
  );
}
