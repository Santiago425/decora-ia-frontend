import { Copy, Group, RotateCcw, RotateCw, Trash2, Ungroup } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FurnitureGroup, FurnitureLeaf, type SceneComponent } from '../../editor/composite';
import type { FurnitureAddon, FurnitureCategory, Material } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { categoryIcon } from './categoryIcon';

interface InspectorProps {
  selection: SceneComponent[];
  categories: FurnitureCategory[];
  addons: FurnitureAddon[];
  finishes: Material[];
  palette: string[];
  disabled: boolean;
  onColor: (id: string, color: string) => void;
  onFinish: (id: string, finish: string | null, color: string) => void;
  onAddons: (id: string, addons: string[]) => void;
  onRotate: (id: string, degrees: number) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (id: string) => void;
  rotateStep: number;
}

function Actions({ id, disabled, props }: { id: string; disabled: boolean; props: InspectorProps }) {
  return (
    <div className="inspector-actions">
      <button className="tool-button" onClick={() => props.onRotate(id, props.rotateStep)} disabled={disabled} title="Rotar a la izquierda (R)">
        <RotateCcw size={17} /> <span>Rotar</span>
      </button>
      <button className="tool-button" onClick={() => props.onRotate(id, -props.rotateStep)} disabled={disabled} title="Rotar a la derecha (Shift + R)">
        <RotateCw size={17} /> <span>Rotar</span>
      </button>
      <button className="tool-button" onClick={() => props.onDuplicate(id)} disabled={disabled} title="Duplicar (Ctrl + D)">
        <Copy size={17} /> <span>Duplicar</span>
      </button>
      <button className="tool-button danger" onClick={() => props.onRemove(id)} disabled={disabled} title="Eliminar (Supr)">
        <Trash2 size={17} /> <span>Eliminar</span>
      </button>
    </div>
  );
}

function ItemInspector({ leaf, props }: { leaf: FurnitureLeaf; props: InspectorProps }) {
  const { data } = leaf;
  const category = props.categories.find((c) => c.slug === data.category);
  const Icon = categoryIcon(category?.icon);
  const addons = props.addons.filter((addon) => addon.categories.includes(data.category));
  const colors = [...new Set([...props.palette, data.color])];
  const labels = leaf.furniture().labels();

  return (
    <div className="inspector">
      <header className="inspector-head">
        <span className="catalog-swatch" style={{ background: data.color }}>
          <Icon size={20} aria-hidden="true" />
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
            <button className="finish" aria-pressed={!data.finish} disabled={props.disabled} onClick={() => props.onFinish(data.id, null, data.color)}>
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
        <section className="inspector-section">
          <h4>Complementos</h4>
          <div className="addon-list">
            {addons.map((addon) => {
              const active = data.addons.includes(addon.slug);
              return (
                <label key={addon.slug} className="addon">
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={props.disabled}
                    onChange={() =>
                      props.onAddons(data.id, active ? data.addons.filter((a) => a !== addon.slug) : [...data.addons, addon.slug])
                    }
                  />
                  <span>
                    <strong>{addon.name}</strong>
                    <small>{addon.description}</small>
                  </span>
                  <em>+{formatCurrency(addon.price)}</em>
                </label>
              );
            })}
          </div>
        </section>
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
      <button className="button button-ghost button-block" disabled={props.disabled} onClick={() => props.onUngroup(group.id)}>
        <Ungroup size={17} /> Desagrupar
      </button>
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
        <button className="button button-primary button-block" disabled={props.disabled} onClick={() => props.onGroup(selection.map((s) => s.id))}>
          <Group size={17} /> Agrupar
        </button>
      </div>
    );
  }
  const [component] = selection;
  if (component instanceof FurnitureGroup) return <GroupInspector group={component} props={props} />;
  if (component instanceof FurnitureLeaf) return <ItemInspector leaf={component} props={props} />;
  return null;
}
