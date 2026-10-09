import { useState } from 'react';
import { SafeImage } from './SafeImage.jsx';

export function BeforeAfter({ before, after }) {
  const [position, setPosition] = useState(50);
  return (
    <div className="before-after">
      <SafeImage src={after} alt="Propuesta de la IA" />
      <div className="before-layer" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <SafeImage src={before} alt="Espacio original" />
      </div>
      <div className="divider" style={{ left: `${position}%` }} />
      <span className="ba-label ba-before">Antes</span>
      <span className="ba-label ba-after">Después</span>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Comparar antes y después"
      />
    </div>
  );
}
