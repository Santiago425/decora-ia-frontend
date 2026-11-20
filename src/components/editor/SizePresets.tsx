import type { FloorSize } from '../../utils/measure';
import { formatMeters } from '../../utils/format';

interface SizePresetsProps {
  presets: FloorSize[];
  current: FloorSize | null;
  disabled?: boolean;
  onPick: (size: FloorSize) => void;
}

/** Quick floor sizes from VITE_ROOM_SIZE_PRESETS, each with its area so the choice is easy to picture. */
export function SizePresets({ presets, current, disabled, onPick }: SizePresetsProps) {
  if (!presets.length) return null;
  return (
    <div className="size-presets" role="group" aria-label="Tamaños sugeridos">
      {presets.map(([width, length]) => (
        <button
          key={`${width}x${length}`}
          type="button"
          className="size-preset"
          aria-pressed={current?.[0] === width && current?.[1] === length}
          disabled={disabled}
          onClick={() => onPick([width, length])}
        >
          <strong>{`${formatMeters(width, { unit: false })} × ${formatMeters(length)}`}</strong>
          <small>{formatMeters(width * length, { unit: false })} m²</small>
        </button>
      ))}
    </div>
  );
}
