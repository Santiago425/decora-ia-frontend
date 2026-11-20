import { Heart, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { config } from '../../config';
import type { FurnitureVariant } from '../../editor/editorMediator';
import { catalogService } from '../../services/catalogService';
import type { FurnitureCategory, FurnitureItem, Material, RoomType } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { Tabs } from '../ui';
import { FurnitureDetail } from './FurnitureDetail';
import { FurnitureThumb } from './FurnitureThumb';

interface CatalogPanelProps {
  categories: FurnitureCategory[];
  furniture: FurnitureItem[];
  roomTypes: RoomType[];
  finishes: Material[];
  roomType: string | null;
  roomName: string | null;
  disabled: boolean;
  onAdd: (item: FurnitureItem, variant?: FurnitureVariant) => void;
}

type Sort = 'suggested' | 'price-asc' | 'price-desc' | 'name';

const SUGGESTED = '__suggested';
const ALL = '__all';
const FAVORITES = '__favorites';
const ANY_ROOM = '';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'suggested', label: 'Recomendados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name', label: 'Nombre (A-Z)' },
];
const MAX_DOTS = 3;

const meters = (value: number) => value.toLocaleString(config.locale, { maximumFractionDigits: 2 });
const price = (item: FurnitureItem) => Number(item.price);

/** Step of the price slider: about a hundred stops between the cheapest and the dearest piece, rounded. */
function priceStep(min: number, max: number) {
  const raw = Math.max(1, (max - min) / 100);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return Math.ceil(raw / magnitude) * magnitude;
}

/** Favorites saved in the database. null while unknown or when the server does not offer them. */
function useFavorites() {
  const [ids, setIds] = useState<Set<number> | null>(null);

  useEffect(() => {
    let active = true;
    catalogService
      .favorites()
      .then((list) => active && setIds(new Set(list)))
      .catch(() => active && setIds(null));
    return () => {
      active = false;
    };
  }, []);

  function toggle(id: number) {
    if (!ids) return;
    const on = !ids.has(id);
    const next = (current: Set<number> | null, add: boolean) => {
      const copy = new Set(current);
      if (add) copy.add(id);
      else copy.delete(id);
      return copy;
    };
    setIds((current) => next(current, on));
    // If the server says no, the heart goes back to how it was.
    catalogService.setFavorite(id, on).catch(() => setIds((current) => next(current, !on)));
  }

  return { ids, toggle };
}

export function CatalogPanel({ categories, furniture, roomTypes, finishes, ...props }: CatalogPanelProps) {
  const { roomType, roomName, disabled, onAdd } = props;
  const [filter, setFilter] = useState(roomType ? SUGGESTED : ALL);
  const [query, setQuery] = useState('');
  const [room, setRoom] = useState(ANY_ROOM);
  const [sort, setSort] = useState<Sort>('suggested');
  const [showFilters, setShowFilters] = useState(false);
  const [detail, setDetail] = useState<FurnitureItem | null>(null);
  const favorites = useFavorites();

  const [minPrice, maxPrice] = useMemo(() => {
    const prices = furniture.map(price);
    return prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0];
  }, [furniture]);
  const step = priceStep(minPrice, maxPrice);
  const top = Math.ceil(maxPrice / step) * step;
  const [ceiling, setCeiling] = useState(top);
  useEffect(() => setCeiling(top), [top]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = furniture.filter((item) => {
      if (text && !`${item.name} ${item.category.name} ${item.materials ?? ''}`.toLowerCase().includes(text))
        return false;
      if (room && !item.category.room_types.includes(room)) return false;
      if (price(item) > ceiling) return false;
      if (filter === SUGGESTED) return roomType ? item.category.room_types.includes(roomType) : true;
      if (filter === FAVORITES) return favorites.ids?.has(item.id) ?? false;
      if (filter === ALL) return true;
      return item.category.slug === filter;
    });
    if (sort === 'price-asc') return [...list].sort((a, b) => price(a) - price(b));
    if (sort === 'price-desc') return [...list].sort((a, b) => price(b) - price(a));
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name, config.locale));
    return list;
  }, [furniture, filter, query, room, ceiling, sort, roomType, favorites.ids]);

  const filtersOn = Number(room !== ANY_ROOM) + Number(sort !== 'suggested') + Number(ceiling < top);

  function resetFilters() {
    setRoom(ANY_ROOM);
    setSort('suggested');
    setCeiling(top);
  }

  return (
    <div className="catalog-panel">
      <div className="catalog-searchbar">
        <label className="catalog-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar muebles y decoración"
            aria-label="Buscar en el catálogo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="catalog-filter-toggle"
          aria-expanded={showFilters}
          aria-controls="catalog-filters"
          title="Ordenar y filtrar"
          onClick={() => setShowFilters((open) => !open)}
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span className="sr-only">Ordenar y filtrar</span>
          {filtersOn > 0 && <span className="catalog-filter-count">{filtersOn}</span>}
        </button>
      </div>

      {showFilters && (
        <div id="catalog-filters" className="catalog-filters">
          <label className="catalog-field">
            <span>Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {roomTypes.length > 0 && (
            <label className="catalog-field">
              <span>Habitación</span>
              <select value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value={ANY_ROOM}>Cualquiera</option>
                {roomTypes.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {maxPrice > minPrice && (
            <label className="catalog-field catalog-price">
              <span>
                Precio hasta <strong>{formatCurrency(ceiling)}</strong>
              </span>
              <input
                type="range"
                min={Math.floor(minPrice / step) * step}
                max={top}
                step={step}
                value={ceiling}
                onChange={(e) => setCeiling(Number(e.target.value))}
              />
            </label>
          )}
          {filtersOn > 0 && (
            <button type="button" className="catalog-reset" onClick={resetFilters}>
              Quitar filtros
            </button>
          )}
        </div>
      )}

      <Tabs
        className="chip-row"
        label="Categorías"
        variant="chips"
        value={filter}
        onChange={setFilter}
        items={[
          ...(roomType ? [{ value: SUGGESTED, label: `Para ${roomName?.toLowerCase() ?? 'tu espacio'}` }] : []),
          { value: ALL, label: 'Todos' },
          ...(favorites.ids
            ? [
                {
                  value: FAVORITES,
                  label: `Favoritos${favorites.ids.size ? ` (${favorites.ids.size})` : ''}`,
                  icon: <Heart size={14} aria-hidden="true" />,
                },
              ]
            : []),
          ...categories.map((category) => ({ value: category.slug, label: category.name })),
        ]}
      />

      <p className="catalog-count" aria-live="polite">
        {visible.length === 1 ? '1 pieza' : `${visible.length} piezas`}
      </p>

      <ul className="catalog-list">
        {visible.map((item) => {
          const favorite = favorites.ids?.has(item.id) ?? false;
          const dots = item.color_options ?? [];
          return (
            <li key={item.id} className="catalog-card">
              <button type="button" className="catalog-item" onClick={() => setDetail(item)} title={`Ver ${item.name}`}>
                <span className="catalog-thumb">
                  <FurnitureThumb item={item} />
                  {dots.length > 1 && (
                    <span className="catalog-dots" aria-label={`${dots.length} colores`}>
                      {dots.slice(0, MAX_DOTS).map((dot) => (
                        <i key={dot.hex} style={{ background: dot.hex }} />
                      ))}
                      {dots.length > MAX_DOTS && <em>+{dots.length - MAX_DOTS}</em>}
                    </span>
                  )}
                </span>
                <span className="catalog-text">
                  <strong>{item.name}</strong>
                  <small>
                    {meters(item.width)} × {meters(item.depth)} m
                  </small>
                  <b className="catalog-price-tag">{formatCurrency(item.price)}</b>
                </span>
              </button>
              {favorites.ids && (
                <button
                  type="button"
                  className="catalog-heart"
                  aria-pressed={favorite}
                  aria-label={favorite ? `Quitar ${item.name} de favoritos` : `Guardar ${item.name} en favoritos`}
                  onClick={() => favorites.toggle(item.id)}
                >
                  <Heart size={16} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="catalog-add"
                disabled={disabled}
                aria-label={`Agregar ${item.name}`}
                title={`Agregar ${item.name}`}
                onClick={() => onAdd(item)}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </li>
          );
        })}
        {!visible.length && (
          <li className="panel-empty">
            {filter === FAVORITES
              ? 'Todavía no tienes favoritos. Toca el corazón de un mueble para guardarlo aquí.'
              : 'No hay piezas con ese filtro.'}
          </li>
        )}
      </ul>

      <FurnitureDetail
        item={detail}
        finishes={finishes}
        roomTypes={roomTypes}
        favorite={detail && favorites.ids ? favorites.ids.has(detail.id) : null}
        disabled={disabled}
        onFavorite={(item) => favorites.toggle(item.id)}
        onAdd={onAdd}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
