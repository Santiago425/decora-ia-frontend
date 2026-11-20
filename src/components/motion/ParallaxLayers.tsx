import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Exposes the pointer and scroll position as --px, --py and --scroll so layers can move by depth in CSS. */
export function ParallaxLayers({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || still) return;
    let frame = 0;
    const update = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--px', x.toFixed(3));
        element.style.setProperty('--py', y.toFixed(3));
      });
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const box = element.getBoundingClientRect();
      update((event.clientX - box.left) / box.width - 0.5, (event.clientY - box.top) / box.height - 0.5);
    };
    const onScroll = () => {
      const box = element.getBoundingClientRect();
      element.style.setProperty('--scroll', Math.max(-1, Math.min(1, -box.top / box.height)).toFixed(3));
    };
    const onLeave = () => update(0, 0);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [still]);

  return (
    <div ref={ref} className={`parallax ${className}`}>
      {children}
    </div>
  );
}
