import { ArrowLeft, Heart, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { config } from '../../config';
import type { FurnitureVariant } from '../../editor/editorMediator';
import type { FurnitureItem, Material, RoomType } from '../../types/catalog';
import { formatCurrency } from '../../utils/format';
import { Button, Modal } from '../ui';
import { CategoryIcon } from './categoryIcon';
import { FurnitureThumb } from './FurnitureThumb';

interface FurnitureDetailProps {
  item: FurnitureItem | null;
  finishes: Material[];
  roomTypes: RoomType[];
  favorite: boolean | null;
  disabled: boolean;
  onFavorite: (item: FurnitureItem) => void;
  onAdd: (item: FurnitureItem, variant: FurnitureVariant) => void;
  onClose: () => void;
}

const meters = (value: number) =>
  `${value.toLocaleString(config.locale, { maximumFractionDigits: 2, minimumFractionDigits: value < 1 ? 2 : 0 })} m`;

/** Full sheet of one catalog piece: big 3D preview, measures, materials, and the color or finish to add it in. */
export function FurnitureDetail({ item, ...props }: FurnitureDetailProps) {
  const [color, setColor] = useState<string | null>(null);
  const [finish, setFinish] = useState<string | null>(null);

  useEffect(() => {
    setColor(null);
    setFinish(null);
  }, [item?.id]);

  if (!item) return <Modal open={false} title="" onClose={props.onClose} />;

  const colors = item.color_options?.length ? item.color_options : [{ name: 'Original', hex: item.default_color }];
  const finishes = (item.finish_options ?? [])
    .map((slug) => props.finishes.find((material) => material.slug === slug))
    .filter((material) => material !== undefined);
  const material = finishes.find((option) => option.slug === finish);
  const shown = material?.color_hex ?? color ?? colors[0].hex;
  const colorName = material ? material.name : (colors.find((option) => option.hex === shown)?.name ?? 'Original');
  const rooms = props.roomTypes.filter((room) => item.category.room_types.includes(room.slug)).map((room) => room.name);

  return (
    <Modal
      open
      title={item.name}
      onClose={props.onClose}
      className="furniture-detail"
      closeOnBackdrop
      footer={
        <>
          <Button variant="ghost" className="detail-back" onClick={props.onClose}>
            <ArrowLeft size={16} /> Regresar
          </Button>
          {props.favorite !== null && (
            <Button
              variant="ghost"
              aria-pressed={props.favorite}
              className="detail-favorite"
              onClick={() => props.onFavorite(item)}
            >
              <Heart size={16} fill={props.favorite ? 'currentColor' : 'none'} />
              {props.favorite ? 'En favoritos' : 'Guardar'}
            </Button>
          )}
          <Button
            disabled={props.disabled}
            onClick={() => {
              props.onAdd(item, material ? { color: material.color_hex, finish: material.slug } : { color: shown });
              props.onClose();
            }}
          >
            <Plus size={16} /> Agregar al diseño
          </Button>
        </>
      }
    >
      <button type="button" className="detail-close" aria-label="Cerrar y volver al catálogo" onClick={props.onClose}>
        <X size={18} aria-hidden="true" />
      </button>
      <div className="detail-layout">
        <div className="detail-stage">
          <FurnitureThumb item={item} color={shown} finish={material} size={520} />
          <span className="detail-category">
            <CategoryIcon name={item.category.icon} size={14} aria-hidden="true" /> {item.category.name}
          </span>
        </div>
        <div className="detail-info">
          <p className="detail-price">{formatCurrency(item.price)}</p>
          {item.description && <p className="detail-description">{item.description}</p>}
          <dl className="detail-facts">
            <div>
              <dt>Ancho</dt>
              <dd>{meters(item.width)}</dd>
            </div>
            <div>
              <dt>Fondo</dt>
              <dd>{meters(item.depth)}</dd>
            </div>
            <div>
              <dt>Alto</dt>
              <dd>{meters(item.height)}</dd>
            </div>
          </dl>
          {item.materials && (
            <p className="detail-line">
              <strong>Materiales</strong> {item.materials}
            </p>
          )}
          {rooms.length > 0 && (
            <p className="detail-line">
              <strong>Queda bien en</strong> {rooms.join(', ')}
            </p>
          )}

          <section className="detail-options" aria-label="Colores">
            <h3>
              Color <span>{colorName}</span>
            </h3>
            <div className="swatch-row">
              {colors.map((option) => (
                <button
                  key={option.hex}
                  type="button"
                  className="swatch"
                  style={{ background: option.hex }}
                  title={option.name}
                  aria-label={`Color ${option.name}`}
                  aria-pressed={!material && shown === option.hex}
                  onClick={() => {
                    setFinish(null);
                    setColor(option.hex);
                  }}
                />
              ))}
            </div>
          </section>

          {finishes.length > 0 && (
            <section className="detail-options" aria-label="Acabados">
              <h3>Acabado</h3>
              <div className="finish-grid">
                {finishes.map((option) => (
                  <button
                    key={option.slug}
                    type="button"
                    className="finish"
                    aria-pressed={finish === option.slug}
                    onClick={() => setFinish(finish === option.slug ? null : option.slug)}
                  >
                    <span className="finish-dot" style={{ background: option.color_hex }} />
                    {option.name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}
