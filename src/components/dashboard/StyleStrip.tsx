import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { catalogService } from '../../services/catalogService';
import { ImageProxy } from '../ImageProxy';
import { TiltCard } from '../motion';

export function StyleStrip() {
  const { data } = useAsync(useCallback(() => catalogService.styles(), []));
  if (!data?.length) return null;
  return (
    <div className="style-strip">
      {data.map((style) => (
        <TiltCard key={style.slug} className="style-tilt">
          <Link to={`/redesign?style=${style.slug}`} className="style-tile">
            <ImageProxy src={style.image_url} alt={`Estilo ${style.name}`} />
            <div className="style-tile-text">
              <strong>{style.name}</strong>
              <span className="style-swatches">
                {style.palettes[0]?.colors.slice(0, 5).map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
            </div>
          </Link>
        </TiltCard>
      ))}
    </div>
  );
}
