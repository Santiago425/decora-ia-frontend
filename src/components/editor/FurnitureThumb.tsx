import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { furnitureFactoryFor } from '../../editor/furnitureFactory';
import { isoThumbnail } from '../../editor/isoThumbnail';
import { cachedThumbnail, requestThumbnail } from '../../editor/thumbnailRenderer';
import type { FurnitureItem, Material } from '../../types/catalog';

interface FurnitureThumbProps {
  item: FurnitureItem;
  /** Color to show instead of the default one, such as a variant picked in the detail sheet. */
  color?: string;
  finish?: Pick<Material, 'slug' | 'roughness' | 'metalness'>;
  /** Pixel size of the rendered picture. */
  size?: number;
}

function IsoDrawing({ item, color }: { item: FurnitureItem; color: string }) {
  const { shapes, viewBox } = useMemo(
    () =>
      isoThumbnail(furnitureFactoryFor(item.category.shape).createModel([item.width, item.depth, item.height], color)),
    [item, color],
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
}

/**
 * Preview drawn from the same factory that builds the 3D model, so it always matches. It renders a real
 * 3D picture once the card scrolls into view, and keeps the flat isometric drawing where WebGL is missing.
 */
export const FurnitureThumb = memo(function FurnitureThumb({ item, color, finish, size = 160 }: FurnitureThumbProps) {
  const tint = color ?? item.default_color;
  const key = `${item.category.shape}|${item.width}|${item.depth}|${item.height}|${tint}|${finish?.slug ?? ''}|${size}`;
  const [url, setUrl] = useState<string | null>(() => cachedThumbnail(key));
  const [visible, setVisible] = useState(false);
  const holder = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = holder.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setUrl(cachedThumbnail(key));
    requestThumbnail(key, size, () =>
      furnitureFactoryFor(item.category.shape).createModel([item.width, item.depth, item.height], tint, finish),
    ).then((rendered) => active && setUrl(rendered));
    return () => {
      active = false;
    };
  }, [visible, key, size, item, tint, finish]);

  return (
    <span ref={holder} className="furniture-thumb-holder">
      {url ? (
        <img className="furniture-thumb furniture-render" src={url} alt="" draggable={false} />
      ) : (
        <IsoDrawing item={item} color={tint} />
      )}
    </span>
  );
});
