import type { Material } from '../../types/catalog';

/** A material as a small texture photo when the catalog has one, or as its color otherwise. */
export function MaterialSwatch({ material }: { material: Material }) {
  return (
    <span className="material-pill">
      <span className="material-pill-chip" style={{ background: material.color_hex }} aria-hidden="true">
        {material.texture_url && (
          <img
            src={material.texture_url}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        )}
      </span>
      <small>{material.name}</small>
    </span>
  );
}
