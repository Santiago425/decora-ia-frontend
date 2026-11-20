import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { config } from '../config';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { introSession } from './introSession';
import { LogoMark } from './Logo';
import { SceneBoundary } from './three/SceneBoundary';

let roomChunk: ReturnType<typeof loadRoom> | null = null;
function loadRoom() {
  return import('./three/IntroRoom');
}
const preloadRoom = () => (roomChunk ??= loadRoom());
const IntroRoom = lazy(preloadRoom);
const DURATION_MS = 2500;
const STILL_MS = 1200;
const EXIT_MS = 450;

if (!introSession.seen()) preloadRoom().catch(() => undefined);

const INTRO_START = performance.now();
const pad = (value: number) => String(value).padStart(3, '0');

export function Intro() {
  const [open, setOpen] = useState(() => !introSession.seen());
  const [leaving, setLeaving] = useState(false);
  const still = useReducedMotion();
  const origin = useRef(INTRO_START);
  const counter = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => {
    introSession.markSeen();
    setLeaving(true);
    window.setTimeout(() => setOpen(false), still ? 0 : EXIT_MS);
  }, [still]);

  useEffect(() => {
    if (!open || leaving) return;
    let frame = 0;
    const total = still ? STILL_MS : DURATION_MS;
    const tick = () => {
      const progress = Math.min(1, (performance.now() - origin.current) / total);
      if (counter.current) counter.current.textContent = pad(Math.round((still ? 1 : 1 - (1 - progress) ** 2) * 100));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else close();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, leaving, still, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className={`intro${leaving ? ' leaving' : ''}`} role="dialog" aria-label={`Bienvenida a ${config.appName}`}>
      <div className="intro-scene" aria-hidden="true">
        <SceneBoundary>
          <Suspense fallback={null}>
            <IntroRoom origin={origin.current} still={still} />
          </Suspense>
        </SceneBoundary>
      </div>
      <div className="intro-brand">
        <LogoMark size={44} />
        <span className="intro-name">{config.appName}</span>
      </div>
      <p className="intro-tagline">Tu casa, antes de mover un solo mueble.</p>
      <div className="intro-counter" aria-hidden="true">
        <span ref={counter}>000</span>
        <small>%</small>
      </div>
      <button type="button" className="intro-skip" onClick={close}>
        Saltar intro
      </button>
    </div>
  );
}
