import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
}

/** Leans its content toward the mouse (up to `max` degrees) with a glare that follows the cursor. */
export function TiltCard({ children, className = '', style, max = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const element = ref.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--tilt-x', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
      element.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
      element.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
    });
  }

  function handleLeave() {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  }

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  );
}
