import { RotateCw } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  flipLabel: string;
}

/** Turns over on hover (or with its corner button on touch screens) to show `back`. */
export function FlipCard({ front, back, className = '', flipLabel }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`flip-card ${flipped ? 'flipped' : ''} ${className}`}>
      <div className="flip-inner">
        <div className="flip-face flip-front">{front}</div>
        <div className="flip-face flip-back" aria-hidden={!flipped}>
          {back}
        </div>
      </div>
      <button
        type="button"
        className="flip-toggle"
        aria-pressed={flipped}
        aria-label={flipLabel}
        onClick={() => setFlipped((value) => !value)}
      >
        <RotateCw size={14} />
      </button>
    </div>
  );
}
