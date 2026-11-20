import { Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { adminService } from '../../services/adminService';
import { catalogService } from '../../services/catalogService';
import { notificationCenter } from '../../services/notificationCenter';
import type {
  AdminAddon,
  AdminFurniture,
  AdminRoomType,
  AdminStyle,
  FurnitureFilters,
  FurnitureInput,
} from '../../types/admin';
import type { FurnitureCategory } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { cssVar } from '../../styles/theme';
import { Button, Pager, Panel, SkeletonList, Tabs } from '../ui';

type Section = 'furniture' | 'styles' | 'rooms' | 'addons';

const SECTIONS: Record<Section, string> = {
  furniture: 'Muebles',
  styles: 'Estilos',
  rooms: 'Habitaciones',
  addons: 'Complementos',
};

function notifyError(error: unknown) {
  notificationCenter.notify((error as Error).message, 'error');
}

function PriceInput({ value, onSave, label }: { value: string; onSave: (price: string) => void; label: string }) {
  const [draft, setDraft] = useState(String(Math.round(Number(value))));
  useEffect(() => setDraft(String(Math.round(Number(value)))), [value]);
  const commit = () => {
    if (Number(draft) > 0 && Number(draft) !== Number(value)) onSave(draft);
    else setDraft(String(Math.round(Number(value))));
  };
  return (
    <input
      className="price-input"
      type="number"
      min={1}
      step={1000}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      aria-label={label}
    />
  );
}

function ActiveSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span />
    </label>
  );
}

const emptyFurniture = (): FurnitureInput => ({
  category: '',
  name: '',
  description: '',
  price: '',
  width: 1,
  depth: 0.6,
  height: 0.8,
  default_color: cssVar('--chart-3'),
});

function NewFurnitureForm({
  categories,
  onCreated,
  onClose,
}: {
  categories: FurnitureCategory[];
  onCreated: (item: AdminFurniture) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FurnitureInput>({ ...emptyFurniture(), category: categories[0]?.slug ?? '' });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FurnitureInput>(key: K, value: FurnitureInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await adminService.createFurniture(form);
      notificationCenter.notify(`Agregaste ${created.name} al catálogo`, 'success');
      onCreated(created);
    } catch (e) {
      notifyError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="new-furniture" onSubmit={submit}>
      <header>
        <h3>Nuevo mueble</h3>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
      </header>
      <label>
        Nombre
        <input required minLength={2} maxLength={80} value={form.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label>
        Categoría
        <select className="admin-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Precio
        <input
          required
          type="number"
          min={1}
          step={1000}
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
        />
      </label>
      <div className="dims">
        {(['width', 'depth', 'height'] as const).map((key) => (
          <label key={key}>
            {{ width: 'Ancho (m)', depth: 'Fondo (m)', height: 'Alto (m)' }[key]}
            <input
              required
              type="number"
              min={0.05}
              max={key === 'height' ? 5 : 10}
              step={0.05}
              value={form[key]}
              onChange={(e) => set(key, Number(e.target.value))}
            />
          </label>
        ))}
      </div>
      <label className="color-field">
        Color
        <input type="color" value={form.default_color} onChange={(e) => set('default_color', e.target.value)} />
      </label>
      <label className="full">
        Descripción
        <input maxLength={500} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </label>
      <Button className="full" type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Agregar al catálogo'}
      </Button>
    </form>
  );
}

const loadFurniture = (filters: FurnitureFilters) => adminService.furniture(filters);

function FurnitureTable() {
  const { data: categories } = useAsync(useCallback(() => catalogService.categories(), []));
  const [filters, setFilters] = useState<FurnitureFilters>({ search: '', category: '', active: '', page: 1 });
  const { data, setData, loading } = usePagedQuery(filters, loadFurniture, notifyError);
  const [creating, setCreating] = useState(false);
  const filter = (patch: Partial<FurnitureFilters>) => setFilters((current) => ({ ...current, page: 1, ...patch }));
  const setItems = (update: (items: AdminFurniture[]) => AdminFurniture[]) =>
    setData((current) => current && { ...current, items: update(current.items) });

  async function save(item: AdminFurniture, patch: Parameters<typeof adminService.updateFurniture>[1]) {
    try {
      const updated = await adminService.updateFurniture(item.id, patch);
      setItems((list) => list.map((i) => (i.id === updated.id ? updated : i)));
      notificationCenter.notify(`Guardaste ${updated.name}`, 'success');
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <>
      <div className="catalog-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => filter({ search: e.target.value })}
            placeholder="Buscar mueble"
            aria-label="Buscar muebles"
          />
        </label>
        <select
          className="admin-select"
          value={filters.category}
          onChange={(e) => filter({ category: e.target.value })}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categories?.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          value={filters.active}
          onChange={(e) => filter({ active: e.target.value as FurnitureFilters['active'] })}
          aria-label="Filtrar por visibilidad"
        >
          <option value="">Visibles y ocultos</option>
          <option value="true">Solo visibles</option>
          <option value="false">Solo ocultos</option>
        </select>
        <span className="muted">{data ? `${data.total} muebles` : 'Cargando…'}</span>
        <Button onClick={() => setCreating(true)} disabled={!categories}>
          <Plus size={18} /> Nuevo mueble
        </Button>
      </div>
      {creating && categories && (
        <NewFurnitureForm
          categories={categories}
          onClose={() => setCreating(false)}
          onCreated={(item) => {
            setItems((list) => [item, ...list]);
            setCreating(false);
          }}
        />
      )}
      <div className={`table-wrap ${loading && data ? 'is-refreshing' : ''}`}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mueble</th>
              <th>Categoría</th>
              <th>Medidas</th>
              <th>Precio</th>
              <th>Visible</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((item) => (
              <tr key={item.id} className={item.is_active ? '' : 'inactive'}>
                <td>
                  <div className="user-cell">
                    <span className="swatch" style={{ background: item.default_color }} />
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td data-label="Categoría">{item.category.name}</td>
                <td data-label="Medidas">
                  {item.width} × {item.depth} × {item.height} m
                </td>
                <td data-label="Precio">
                  <PriceInput
                    value={item.price}
                    onSave={(price) => save(item, { price })}
                    label={`Precio de ${item.name}`}
                  />
                </td>
                <td data-label="Visible">
                  <ActiveSwitch
                    checked={item.is_active}
                    onChange={(is_active) => save(item, { is_active })}
                    label={`Mostrar ${item.name} en el catálogo`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data && <SkeletonList count={5} className="table-row-skeleton" />}
        {data && data.items.length === 0 && <p className="panel-empty table-empty">No hay muebles con esos filtros.</p>}
      </div>
      {data && (
        <Pager
          page={filters.page}
          total={data.total}
          pageSize={data.page_size}
          onChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      )}
    </>
  );
}

function CoverInput({ value, label, onSave }: { value: string | null; label: string; onSave: (url: string) => void }) {
  const [draft, setDraft] = useState(value ?? '');
  const commit = () => draft.trim() !== (value ?? '') && onSave(draft.trim());
  return (
    <input
      className="cover-input"
      type="url"
      inputMode="url"
      placeholder="https://…"
      value={draft}
      aria-label={label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
    />
  );
}

function RoomTypesTable() {
  const [rooms, setRooms] = useState<AdminRoomType[] | null>(null);
  useEffect(() => {
    adminService.roomTypes().then(setRooms).catch(notifyError);
  }, []);

  async function save(room: AdminRoomType, patch: Parameters<typeof adminService.updateRoomType>[1]) {
    try {
      const updated = await adminService.updateRoomType(room.id, patch);
      setRooms((list) => list?.map((r) => (r.id === updated.id ? updated : r)) ?? null);
      notificationCenter.notify(`Guardaste ${updated.name}`, 'success');
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <div className="style-admin-grid">
      {rooms?.map((room) => (
        <article key={room.id} className={`style-admin-card ${room.is_active ? '' : 'inactive'}`}>
          <div
            className="style-admin-image"
            style={{ backgroundImage: room.cover_image_url ? `url(${room.cover_image_url})` : undefined }}
          />
          <div className="style-admin-body">
            <header>
              <h3>{room.name}</h3>
              <ActiveSwitch
                checked={room.is_active}
                onChange={(is_active) => save(room, { is_active })}
                label={`Mostrar ${room.name}`}
              />
            </header>
            <div className="cover-field">
              <span>Foto de portada</span>
              <CoverInput
                value={room.cover_image_url}
                label={`Foto de portada de ${room.name}`}
                onSave={(cover_image_url) => save(room, { cover_image_url })}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function StylesTable() {
  const [styles, setStyles] = useState<AdminStyle[] | null>(null);
  useEffect(() => {
    adminService.styles().then(setStyles).catch(notifyError);
  }, []);

  async function save(style: AdminStyle, patch: Parameters<typeof adminService.updateStyle>[1]) {
    try {
      const updated = await adminService.updateStyle(style.id, patch);
      setStyles(
        (list) => list?.map((s) => (s.id === updated.id ? { ...updated, project_count: s.project_count } : s)) ?? null,
      );
      notificationCenter.notify(`Guardaste el estilo ${updated.name}`, 'success');
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <div className="style-admin-grid">
      {styles?.map((style) => (
        <article key={style.id} className={`style-admin-card ${style.is_active ? '' : 'inactive'}`}>
          <div
            className="style-admin-image"
            style={{ backgroundImage: style.image_url ? `url(${style.image_url})` : undefined }}
          />
          <div className="style-admin-body">
            <header>
              <h3>{style.name}</h3>
              <ActiveSwitch
                checked={style.is_active}
                onChange={(is_active) => save(style, { is_active })}
                label={`Mostrar el estilo ${style.name}`}
              />
            </header>
            <p>{style.description}</p>
            <div className="cover-field">
              <span>Foto de portada</span>
              <CoverInput
                value={style.image_url}
                label={`Foto de portada del estilo ${style.name}`}
                onSave={(image_url) => save(style, { image_url })}
              />
            </div>
            <div className="style-admin-meta">
              <span>
                {style.project_count} {style.project_count === 1 ? 'proyecto' : 'proyectos'}
              </span>
              <label title="Color de la luz en el editor 3D">
                <input
                  type="color"
                  value={style.lighting_color}
                  onChange={(e) => save(style, { lighting_color: e.target.value })}
                  aria-label={`Color de luz de ${style.name}`}
                />
                Luz
              </label>
              <label>
                Intensidad
                <input
                  type="range"
                  min={0.3}
                  max={2}
                  step={0.1}
                  defaultValue={style.lighting_intensity}
                  onPointerUp={(e) => save(style, { lighting_intensity: Number((e.target as HTMLInputElement).value) })}
                  onKeyUp={(e) => save(style, { lighting_intensity: Number((e.target as HTMLInputElement).value) })}
                  aria-label={`Intensidad de luz de ${style.name}`}
                />
              </label>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function AddonsTable() {
  const [addons, setAddons] = useState<AdminAddon[] | null>(null);
  const { data: categories } = useAsync(useCallback(() => catalogService.categories(), []));
  const categoryName = (slug: string) => categories?.find((c) => c.slug === slug)?.name ?? slug;
  useEffect(() => {
    adminService.addons().then(setAddons).catch(notifyError);
  }, []);

  async function save(addon: AdminAddon, patch: { price?: string; is_active?: boolean }) {
    try {
      const updated = await adminService.updateAddon(addon.id, patch);
      setAddons((list) => list?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
      notificationCenter.notify(`Guardaste ${updated.name}`, 'success');
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Complemento</th>
            <th>Se aplica a</th>
            <th>Precio</th>
            <th>Visible</th>
          </tr>
        </thead>
        <tbody>
          {addons?.map((addon) => (
            <tr key={addon.id} className={addon.is_active ? '' : 'inactive'}>
              <td>
                <strong>{addon.name}</strong>
                <small className="cell-note">{addon.description}</small>
              </td>
              <td data-label="Se aplica a">
                {addon.categories.length ? addon.categories.map(categoryName).join(', ') : 'Todos los muebles'}
              </td>
              <td data-label="Precio">
                <PriceInput
                  value={addon.price}
                  onSave={(price) => save(addon, { price })}
                  label={`Precio de ${addon.name}`}
                />
                <small className="cell-note">{formatCurrency(addon.price)}</small>
              </td>
              <td data-label="Visible">
                <ActiveSwitch
                  checked={addon.is_active}
                  onChange={(is_active) => save(addon, { is_active })}
                  label={`Mostrar ${addon.name}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CatalogAdmin() {
  const [section, setSection] = useState<Section>('furniture');
  return (
    <Panel
      className="admin-panel"
      title="Catálogo"
      description="Los cambios se ven al instante en el editor 3D, en el rediseño y en Lumi."
      actions={
        <Tabs
          label="Secciones del catálogo"
          variant="chips"
          value={section}
          onChange={setSection}
          items={(Object.keys(SECTIONS) as Section[]).map((key) => ({ value: key, label: SECTIONS[key] }))}
        />
      }
    >
      {section === 'furniture' && <FurnitureTable />}
      {section === 'styles' && <StylesTable />}
      {section === 'rooms' && <RoomTypesTable />}
      {section === 'addons' && <AddonsTable />}
    </Panel>
  );
}
