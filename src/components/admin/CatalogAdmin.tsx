import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { adminService } from '../../services/adminService';
import { catalogService } from '../../services/catalogService';
import { notificationCenter } from '../../services/notificationCenter';
import type { AdminAddon, AdminFurniture, AdminStyle, FurnitureInput } from '../../types/admin';
import type { FurnitureCategory } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';

type Section = 'furniture' | 'styles' | 'addons';

const SECTIONS: Record<Section, string> = { furniture: 'Muebles', styles: 'Estilos', addons: 'Complementos' };

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

function ActiveSwitch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span />
    </label>
  );
}

const EMPTY_FURNITURE: FurnitureInput = {
  category: '',
  name: '',
  description: '',
  price: '',
  width: 1,
  depth: 0.6,
  height: 0.8,
  default_color: '#a47551',
};

function NewFurnitureForm({ categories, onCreated, onClose }: { categories: FurnitureCategory[]; onCreated: (item: AdminFurniture) => void; onClose: () => void }) {
  const [form, setForm] = useState<FurnitureInput>({ ...EMPTY_FURNITURE, category: categories[0]?.slug ?? '' });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FurnitureInput>(key: K, value: FurnitureInput[K]) => setForm((f) => ({ ...f, [key]: value }));

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
        <input required type="number" min={1} step={1000} value={form.price} onChange={(e) => set('price', e.target.value)} />
      </label>
      <div className="dims">
        {(['width', 'depth', 'height'] as const).map((key) => (
          <label key={key}>
            {{ width: 'Ancho (m)', depth: 'Fondo (m)', height: 'Alto (m)' }[key]}
            <input required type="number" min={0.05} max={key === 'height' ? 5 : 10} step={0.05} value={form[key]} onChange={(e) => set(key, Number(e.target.value))} />
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
      <button className="button button-primary full" disabled={saving}>
        {saving ? 'Guardando…' : 'Agregar al catálogo'}
      </button>
    </form>
  );
}

function FurnitureTable() {
  const { data: categories } = useAsync(useCallback(() => catalogService.categories(), []));
  const [items, setItems] = useState<AdminFurniture[] | null>(null);
  const [category, setCategory] = useState('all');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    adminService.furniture().then(setItems).catch(notifyError);
  }, []);

  const visible = useMemo(() => (items ?? []).filter((i) => category === 'all' || i.category.slug === category), [items, category]);

  async function save(item: AdminFurniture, patch: Parameters<typeof adminService.updateFurniture>[1]) {
    try {
      const updated = await adminService.updateFurniture(item.id, patch);
      setItems((list) => list?.map((i) => (i.id === updated.id ? updated : i)) ?? null);
      notificationCenter.notify(`Guardaste ${updated.name}`, 'success');
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <>
      <div className="catalog-toolbar">
        <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrar por categoría">
          <option value="all">Todas las categorías</option>
          {categories?.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="muted">{visible.length} muebles</span>
        <button className="button button-primary" onClick={() => setCreating(true)} disabled={!categories}>
          <Plus size={18} /> Nuevo mueble
        </button>
      </div>
      {creating && categories && (
        <NewFurnitureForm
          categories={categories}
          onClose={() => setCreating(false)}
          onCreated={(item) => {
            setItems((list) => [item, ...(list ?? [])]);
            setCreating(false);
          }}
        />
      )}
      <div className="table-wrap">
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
            {visible.map((item) => (
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
                  <PriceInput value={item.price} onSave={(price) => save(item, { price })} label={`Precio de ${item.name}`} />
                </td>
                <td data-label="Visible">
                  <ActiveSwitch checked={item.is_active} onChange={(is_active) => save(item, { is_active })} label={`Mostrar ${item.name} en el catálogo`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
      setStyles((list) => list?.map((s) => (s.id === updated.id ? { ...updated, project_count: s.project_count } : s)) ?? null);
      notificationCenter.notify(`Guardaste el estilo ${updated.name}`, 'success');
    } catch (e) {
      notifyError(e);
    }
  }

  return (
    <div className="style-admin-grid">
      {styles?.map((style) => (
        <article key={style.id} className={`style-admin-card ${style.is_active ? '' : 'inactive'}`}>
          <div className="style-admin-image" style={{ backgroundImage: style.image_url ? `url(${style.image_url})` : undefined }} />
          <div className="style-admin-body">
            <header>
              <h3>{style.name}</h3>
              <ActiveSwitch checked={style.is_active} onChange={(is_active) => save(style, { is_active })} label={`Mostrar el estilo ${style.name}`} />
            </header>
            <p>{style.description}</p>
            <div className="style-admin-meta">
              <span>
                {style.project_count} {style.project_count === 1 ? 'proyecto' : 'proyectos'}
              </span>
              <label title="Color de la luz en el editor 3D">
                <input type="color" value={style.lighting_color} onChange={(e) => save(style, { lighting_color: e.target.value })} aria-label={`Color de luz de ${style.name}`} />
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
              <td data-label="Se aplica a">{addon.categories.length ? addon.categories.map(categoryName).join(', ') : 'Todos los muebles'}</td>
              <td data-label="Precio">
                <PriceInput value={addon.price} onSave={(price) => save(addon, { price })} label={`Precio de ${addon.name}`} />
                <small className="cell-note">{formatCurrency(addon.price)}</small>
              </td>
              <td data-label="Visible">
                <ActiveSwitch checked={addon.is_active} onChange={(is_active) => save(addon, { is_active })} label={`Mostrar ${addon.name}`} />
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
    <section className="panel admin-panel">
      <header className="admin-panel-head">
        <div>
          <h2>Catálogo</h2>
          <p>Los cambios se ven al instante en el editor 3D, en el rediseño y en Lumi.</p>
        </div>
        <div className="chips" role="tablist">
          {(Object.keys(SECTIONS) as Section[]).map((key) => (
            <button key={key} role="tab" aria-selected={section === key} className={`chip ${section === key ? 'selected' : ''}`} onClick={() => setSection(key)}>
              {SECTIONS[key]}
            </button>
          ))}
        </div>
      </header>
      {section === 'furniture' && <FurnitureTable />}
      {section === 'styles' && <StylesTable />}
      {section === 'addons' && <AddonsTable />}
    </section>
  );
}
