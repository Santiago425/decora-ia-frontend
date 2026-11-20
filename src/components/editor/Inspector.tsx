import { ArrowUpToLine, Check, Copy, Group, RotateCcw, RotateCw, Trash2, Ungroup } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FurnitureGroup, FurnitureLeaf, type SceneComponent } from '../../editor/composite';
import { config } from '../../config';
import type { FurnitureAddon, FurnitureCategory, FurnitureItem, Material } from '../../types/catalog';
import type { SceneItemData } from '../../types/project';
import { FURNITURE_LIMITS, resizeRange } from '../../utils/measure';
import { MeasureInput } from './MeasureInput';
import { darken } from '../../utils/color';
import { formatCurrency } from '../../utils/format';
import { CategoryIcon } from './categoryIcon';
import { Button } from '../ui';

interface InspectorProps {
  selection: SceneComponent[];
  categories: FurnitureCategory[];
  furniture: FurnitureItem[];
  addons: FurnitureAddon[];
  finishes: Material[];
  palette: string[];
  disabled: boolean;
  onColor: (id: string, color: string) => void;
  onFinish: (id: string, finish: string | null, color: string) => void;
  onAddons: (id: string, addons: string[]) => void;
  onRotate: (id: string, degrees: number) => void;
  onDuplicate: (id: string) => void;
  onSnapToWall: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onResize: (id: string, size: SceneItemData['size']) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (id: string) => void;
  rotateStep: number;
}

function Actions({ id, disabled, props }: { id: string; disabled: boolean; props: InspectorProps }) {
  return (
    <div className="inspector-actions">
      <button
        className="tool-button"
        onClick={() => props.onRotate(id, props.rotateStep)}
        disabled={disabled}
        title="Rotar a la izquierda (R)"
      >
        <RotateCcw size={17} /> <span>Rotar</span>
      </button>
      <button
        className="tool-button"
        onClick={() => props.onRotate(id, -props.rotateStep)}
        disabled={disabled}
        title="Rotar a la derecha (Shift + R)"
      >
        <RotateCw size={17} /> <span>Rotar</span>
      </button>
      <button
        className="tool-button"
        onClick={() => props.onDuplicate(id)}
        disabled={disabled}
        title="Duplicar (Ctrl + D)"
      >
        <Copy size={17} /> <span>Duplicar</span>
      </button>
      <button
        className="tool-button"
        onClick={() => props.onSnapToWall(id)}
        disabled={disabled}
        title="Pegar a la pared más cercana (P)"
      >
        <ArrowUpToLine size={17} /> <span>Pegar</span>
      </button>
      <button
        className="tool-button danger"
        onClick={() => props.onRemove(id)}
        disabled={disabled}
        title="Eliminar (Supr)"
      >
        <Trash2 size={17} /> <span>Eliminar</span>
      </button>
    </div>
  );
}

const SIDES = [
  { index: 0, label: 'Ancho' },
  { index: 1, label: 'Fondo' },
  { index: 2, label: 'Alto' },
] as const;

/** Width, depth and height of one piece, limited around its catalog size. */
function ItemSize({ item, props }: { item: SceneItemData; props: InspectorProps }) {
  const catalog = props.furniture.find((f) => f.id === item.furniture_id);
  const base: SceneItemData['size'] = catalog ? [catalog.width, catalog.depth, catalog.height] : item.size;
  const changed = item.size.some((side, i) => side !== base[i]);

  return (
    <section className="inspector-section">
      <h4>Medidas</h4>
      <div className="dimension-row">
        {SIDES.map(({ index, label }) => (
          <MeasureInput
            key={index}
            label={label}
            value={item.size[index]}
            range={resizeRange(base[index], config.editor.resizeFactors, FURNITURE_LIMITS)}
            disabled={props.disabled}
            onCommit={(value) => {
              if (value === null) return;
              const size = [...item.size] as SceneItemData['size'];
              size[index] = value;
              props.onResize(item.id, size);
            }}
          />
        ))}
      </div>
      {changed && (
        <button
          type="button"
          className="link-button size-reset"
          disabled={props.disabled}
          onClick={() => props.onResize(item.id, base)}
        >
          Volver a la medida original
        </button>
      )}
    </section>
  );
}

const ADDON_GROUPS: { title: string; services: boolean }[] = [
  { title: 'Decoración', services: false },
  { title: 'Servicios', services: true },
];

export function AddonSection({
  addons,
  chosen,
  disabled,
  onChange,
}: {
  addons: FurnitureAddon[];
  chosen: string[];
  disabled: boolean;
  onChange: (addons: string[]) => void;
}) {
  const picked = addons.filter((addon) => chosen.includes(addon.slug));
  const extra = picked.reduce((sum, addon) => sum + Number(addon.price), 0);

  return (
    <section className="inspector-section addon-section">
      <header className="addon-head">
        <h4>Complementos</h4>
        {picked.length > 0 && (
          <span className="addon-summary">
            {picked.length} {picked.length === 1 ? 'elegido' : 'elegidos'} · +{formatCurrency(extra)}
          </span>
        )}
      </header>
      {ADDON_GROUPS.map(({ title, services }) => {
        const group = addons.filter((addon) => (addon.visual === 'none') === services);
        if (!group.length) return null;
        return (
          <div key={title} className="addon-group">
            <h5>{title}</h5>
            <div className="addon-list">
              {group.map((addon) => {
                const active = chosen.includes(addon.slug);
                return (
                  <label key={addon.slug} className="addon" data-active={active || undefined}>
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={disabled}
                      onChange={() =>
                        onChange(active ? chosen.filter((slug) => slug !== addon.slug) : [...chosen, addon.slug])
                      }
                    />
                    <span
                      className="addon-icon"
                      style={
                        addon.color_hex
                          ? { background: addon.color_hex, color: darken(addon.color_hex, 0.6) }
                          : undefined
                      }
                      data-service={services || undefined}
                    >
                      <CategoryIcon name={addon.icon ?? 'sparkles'} size={16} aria-hidden="true" />
                    </span>
                    <span className="addon-text">
                      <strong>{addon.name}</strong>
                      <small>{addon.description}</small>
                    </span>
                    <em>+{formatCurrency(addon.price)}</em>
                    <Check className="addon-check" size={14} aria-hidden="true" />
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ItemInspector({ leaf, props }: { leaf: FurnitureLeaf; props: InspectorProps }) {
  const { data } = leaf;
  const category = props.categories.find((c) => c.slug === data.category);
  const addons = props.addons.filter((addon) => addon.categories.includes(data.category));
  // The colors the piece is sold in come first, then the accents of the room's style.
  const sold = props.furniture.find((f) => f.id === data.furniture_id)?.color_options ?? [];
  const colors = [...new Set([...sold.map((option) => option.hex), ...props.palette, data.color])];
  const labels = leaf.furniture().labels();

  return (
    <div className="inspector">
      <header className="inspector-head">
        <span className="catalog-swatch" style={{ background: data.color }}>
          <CategoryIcon name={category?.icon} size={20} aria-hidden="true" />
        </span>
        <div>
          <h3>{data.name}</h3>
          <small>{category?.name}</small>
        </div>
      </header>

      <div className="price-box">
        <span>Precio con complementos</span>
        <strong>{formatCurrency(leaf.price())}</strong>
        {labels.length > 1 && <small>Incluye: {labels.slice(1).join(', ')}</small>}
      </div>

      <Actions id={data.id} disabled={props.disabled} props={props} />

      <ItemSize item={data} props={props} />

      <section className="inspector-section">
        <h4>Color</h4>
        <div className="swatch-row">
          {colors.map((color) => (
            <button
              key={color}
              className="swatch"
              style={{ background: color }}
              aria-label={`Color ${color}`}
              aria-pressed={data.color === color && !data.finish}
              disabled={props.disabled}
              onClick={() => props.onColor(data.id, color)}
            />
          ))}
          <label className="swatch swatch-picker" title="Elegir otro color">
            <span className="sr-only">Elegir otro color</span>
            <input
              type="color"
              value={data.color}
              disabled={props.disabled}
              onChange={(e) => props.onColor(data.id, e.target.value)}
            />
          </label>
        </div>
      </section>

      {props.finishes.length > 0 && (
        <section className="inspector-section">
          <h4>Acabado</h4>
          <div className="finish-grid">
            <button
              className="finish"
              aria-pressed={!data.finish}
              disabled={props.disabled}
              onClick={() => props.onFinish(data.id, null, data.color)}
            >
              Original
            </button>
            {props.finishes.map((material) => (
              <button
                key={material.slug}
                className="finish"
                aria-pressed={data.finish === material.slug}
                disabled={props.disabled}
                onClick={() => props.onFinish(data.id, material.slug, material.color_hex)}
              >
                <span className="finish-dot" style={{ background: material.color_hex }} />
                {material.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {addons.length > 0 && (
        <AddonSection
          addons={addons}
          chosen={data.addons}
          disabled={props.disabled}
          onChange={(next) => props.onAddons(data.id, next)}
        />
      )}
    </div>
  );
}

function GroupInspector({ group, props }: { group: FurnitureGroup; props: InspectorProps }) {
  const [name, setName] = useState(group.name);
  useEffect(() => setName(group.name), [group.name]);

  return (
    <div className="inspector">
      <header className="inspector-head">
        <span className="catalog-swatch group-swatch">
          <Group size={20} aria-hidden="true" />
        </span>
        <div>
          <input
            className="inline-input"
            value={name}
            maxLength={80}
            aria-label="Nombre del grupo"
            disabled={props.disabled}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name.trim() !== group.name && props.onRename(group.id, name.trim())}
          />
          <small>Grupo de {group.itemCount()} muebles</small>
        </div>
      </header>
      <div className="price-box">
        <span>Precio del grupo</span>
        <strong>{formatCurrency(group.price())}</strong>
      </div>
      <Actions id={group.id} disabled={props.disabled} props={props} />
      <Button variant="ghost" block disabled={props.disabled} onClick={() => props.onUngroup(group.id)}>
        <Ungroup size={17} /> Desagrupar
      </Button>
      <ul className="group-items">
        {group.leaves().map((leaf) => (
          <li key={leaf.id}>
            <span className="finish-dot" style={{ background: leaf.data.color }} />
            <span>{leaf.name}</span>
            <em>{formatCurrency(leaf.price())}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Inspector(props: InspectorProps) {
  const { selection } = props;
  if (selection.length > 1) {
    const total = selection.reduce((sum, component) => sum + component.price(), 0);
    return (
      <div className="inspector">
        <header className="inspector-head">
          <span className="catalog-swatch group-swatch">
            <Group size={20} aria-hidden="true" />
          </span>
          <div>
            <h3>{selection.length} elementos seleccionados</h3>
            <small>{formatCurrency(total)}</small>
          </div>
        </header>
        <p className="panel-hint">Agrúpalos para moverlos, rotarlos y duplicarlos como una sola pieza.</p>
        <Button block disabled={props.disabled} onClick={() => props.onGroup(selection.map((s) => s.id))}>
          <Group size={17} /> Agrupar
        </Button>
      </div>
    );
  }
  const [component] = selection;
  if (component instanceof FurnitureGroup) return <GroupInspector group={component} props={props} />;
  if (component instanceof FurnitureLeaf) return <ItemInspector leaf={component} props={props} />;
  return null;
}
