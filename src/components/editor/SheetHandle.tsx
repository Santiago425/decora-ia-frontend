import { useRef } from 'react';

export type SheetState = 'peek' | 'half' | 'full';

const ORDER: SheetState[] = ['peek', 'half', 'full'];
const SWIPE_THRESHOLD = 24;

const LABELS: Record<SheetState, string> = {
  peek: 'Mostrar el panel',
  half: 'Agrandar el panel',
  full: 'Achicar el panel',
};

/** Tap cycles the sheet height; a vertical swipe grows or shrinks it one step. */
export function SheetHandle({ state, onChange }: { state: SheetState; onChange: (state: SheetState) => void }) {
  const startY = useRef<number | null>(null);
  const swiped = useRef(false);
  const index = ORDER.indexOf(state);

  return (
    <button
      type="button"
      className="sheet-handle"
      aria-label={LABELS[state]}
      aria-expanded={state !== 'peek'}
      onPointerDown={(event) => {
        startY.current = event.clientY;
        swiped.current = false;
      }}
      onPointerUp={(event) => {
        if (startY.current === null) return;
        const delta = event.clientY - startY.current;
        startY.current = null;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        swiped.current = true;
        const next = Math.min(ORDER.length - 1, Math.max(0, index + (delta < 0 ? 1 : -1)));
        onChange(ORDER[next]);
      }}
      onClick={() => {
        if (swiped.current) return;
        onChange(state === 'full' ? 'peek' : ORDER[index + 1]);
      }}
    >
      <span aria-hidden="true" />
    </button>
  );
}
