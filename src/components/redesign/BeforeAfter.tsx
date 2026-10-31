import { MoveHorizontal } from 'lucide-react';
import { useRef, useState, type PointerEvent } from 'react';

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function moveTo(event: PointerEvent) {
    const box = frame.current!.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100)));
  }

  return (
    <div
      ref={frame}
      className="before-after"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e)}
      onPointerUp={() => (dragging.current = false)}
    >
      <img src={after} alt="Propuesta de la IA" draggable={false} />
      <div className="ba-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={before} alt="Foto original" draggable={false} />
      </div>
      <div className="ba-handle" style={{ left: `${position}%` }}>
        <span>
          <MoveHorizontal size={18} />
        </span>
      </div>
      <span className="ba-label before">Antes</span>
      <span className="ba-label after">Después</span>
      <input
        className="ba-range"
        type="range"
        min={0}
        max={100}
        value={Math.round(position)}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Comparar antes y después"
      />
    </div>
  );
}
