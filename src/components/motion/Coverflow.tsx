import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { photoSources } from '../../utils/photo';

export interface CoverflowItem {
  id: number | string;
  src: string;
  alt: string;
  title: string;
  caption?: string;
}

interface CoverflowProps {
  items: CoverflowItem[];
  label: string;
  onOpen: (item: CoverflowItem) => void;
}

const SPACING = 0.58;
const FRICTION = 0.92;

/** Curved carousel: drag with inertia, arrows or keyboard; a tap opens the photo in front. */
export function Coverflow({ items, label, onOpen }: CoverflowProps) {
  const [position, setPosition] = useState(0);
  const target = useRef(0);
  const current = useRef(0);
  const velocity = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: number } | null>(null);
  const frame = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const last = items.length - 1;

  const animate = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const step = () => {
      if (!drag.current) {
        if (Math.abs(velocity.current) > 0.002) {
          target.current = Math.max(0, Math.min(last, target.current + velocity.current));
          velocity.current *= FRICTION;
        } else {
          velocity.current = 0;
          target.current = Math.round(target.current);
        }
      }
      const distance = target.current - current.current;
      current.current += still ? distance : distance * 0.18;
      setPosition(current.current);
      if (drag.current || Math.abs(distance) > 0.001 || velocity.current !== 0) {
        frame.current = requestAnimationFrame(step);
      }
    };
    frame.current = requestAnimationFrame(step);
  }, [last, still]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const go = (index: number) => {
    velocity.current = 0;
    target.current = Math.max(0, Math.min(last, index));
    animate();
  };

  function handleDown(event: PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, start: event.clientX, moved: 0 };
    velocity.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    animate();
  }

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const width = stage.current?.clientWidth ?? 600;
    const delta = (drag.current.x - event.clientX) / (width * 0.32);
    drag.current.x = event.clientX;
    drag.current.moved = Math.abs(event.clientX - drag.current.start);
    target.current = Math.max(-0.4, Math.min(last + 0.4, target.current + delta));
    velocity.current = delta;
  }

  function handleUp(event: PointerEvent<HTMLDivElement>) {
    const info = drag.current;
    drag.current = null;
    if (!info) return;
    if (info.moved < 6) {
      const card = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
      const index = card ? Number(card.dataset.index) : Math.round(current.current);
      if (index === Math.round(current.current)) onOpen(items[index]);
      else go(index);
      return;
    }
    animate();
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    const center = Math.round(target.current);
    if (event.key === 'ArrowRight') go(center + 1);
    else if (event.key === 'ArrowLeft') go(center - 1);
    else if (event.key === 'Enter') onOpen(items[center]);
    else return;
    event.preventDefault();
  }

  const center = Math.round(position);

  return (
    <div className="coverflow">
      <div
        ref={stage}
        className="coverflow-stage"
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={`coverflow-${items[center]?.id}`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onKeyDown={handleKey}
      >
        {items.map((item, index) => {
          const offset = index - position;
          const distance = Math.abs(offset);
          if (distance > 4.5) return null;
          return (
            <div
              key={item.id}
              id={`coverflow-${item.id}`}
              role="option"
              aria-selected={index === center}
              data-index={index}
              className="coverflow-item"
              style={{
                transform: `translateX(${offset * SPACING * 100}%) translateZ(${-distance * 140}px) rotateY(${Math.max(-1, Math.min(1, offset)) * -38}deg)`,
                zIndex: 100 - Math.round(distance * 10),
                opacity: Math.max(0, 1 - Math.max(0, distance - 2.5)),
              }}
            >
              <img
                {...photoSources(item.src, '(max-width: 720px) 70vw, 420px')}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <div className="coverflow-caption">
                <strong>{item.title}</strong>
                {item.caption && <small>{item.caption}</small>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="coverflow-controls">
        <button
          type="button"
          className="icon-button"
          onClick={() => go(center - 1)}
          disabled={center <= 0}
          aria-label="Foto anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="coverflow-count tabular">
          {String(center + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="icon-button"
          onClick={() => go(center + 1)}
          disabled={center >= last}
          aria-label="Foto siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
