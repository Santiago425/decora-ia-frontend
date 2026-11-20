import { memo, useMemo } from 'react';
import { furnitureFactoryFor } from '../../editor/furnitureFactory';
import { isoThumbnail } from '../../editor/isoThumbnail';
import type { FurnitureItem } from '../../types/catalog';

/** Small isometric preview drawn from the same factory that builds the 3D model, so it always matches. */
export const FurnitureThumb = memo(function FurnitureThumb({ item }: { item: FurnitureItem }) {
  const { shapes, viewBox } = useMemo(
    () =>
      isoThumbnail(
        furnitureFactoryFor(item.category.shape).createModel([item.width, item.depth, item.height], item.default_color),
      ),
    [item],
  );
  return (
    <svg className="furniture-thumb" viewBox={viewBox} aria-hidden="true">
      {shapes.map((shape, index) =>
        shape.kind === 'polygon' ? (
          <polygon key={index} points={shape.points} fill={shape.fill} strokeLinejoin="round" />
        ) : (
          <ellipse key={index} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={shape.fill} />
        ),
      )}
    </svg>
  );
});
