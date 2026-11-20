import { Suspense, lazy } from 'react';
import { SceneBoundary } from '../three/SceneBoundary';

const LumiOrb3D = lazy(() => import('../three/LumiOrb3D'));

interface LumiOrbProps {
  size?: number;
  active?: boolean;
  listening?: boolean;
  /** Renders the WebGL glass sphere; keep it for one or two large orbs per screen. */
  depth?: boolean;
}

export function LumiOrb({ size = 40, active = false, listening = false, depth = false }: LumiOrbProps) {
  const state = [active && 'active', listening && 'listening', depth && 'deep'].filter(Boolean).join(' ');
  return (
    <span className={`lumi-avatar ${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="lumi-glass" />
      {depth && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <LumiOrb3D active={active} listening={listening} />
          </Suspense>
        </SceneBoundary>
      )}
    </span>
  );
}
