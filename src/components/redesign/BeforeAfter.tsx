import { MoveHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const SWEEP_KEY = 'habita.compare.swept';

function hasSwept() {
  try {
    return sessionStorage.getItem(SWEEP_KEY) === '1';
  } catch {
    return true;
  }
}

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const [sweeping, setSweeping] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const still = useReducedMotion();

  useEffect(() => {
    const node = frame.current;
    if (!node || still || hasSwept()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          sessionStorage.setItem(SWEEP_KEY, '1');
        } catch {
          /* storage unavailable */
        }
        setSweeping(true);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [still]);

  function moveTo(event: PointerEvent) {
    if (!frame.current) return;
    const box = frame.current.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100)));
  }

  return (
    <div
      ref={frame}
      className={`before-after ${sweeping ? 'sweeping' : ''}`}
      style={{ '--split': `${position}%` } as CSSProperties}
      onAnimationEnd={() => setSweeping(false)}
      onPointerDown={(e) => {
        dragging.current = true;
        setSweeping(false);
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img src={after} alt="Propuesta de la IA" draggable={false} decoding="async" />
      <div className="ba-before">
        <img src={before} alt="Foto original" draggable={false} decoding="async" />
      </div>
      <div className="ba-handle">
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
