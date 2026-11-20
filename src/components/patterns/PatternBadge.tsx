import { lazy, Suspense } from 'react';
import { usePatternMode } from '../../patterns/patternMode';

const PatternBadgeList = lazy(() => import('./PatternBadgeList'));

/** Shows which design patterns power the piece of UI next to it while "Modo patrones" is on. */
export function PatternBadge({ ids, className }: { ids: string[]; className?: string }) {
  const enabled = usePatternMode();
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <PatternBadgeList ids={ids} className={className} />
    </Suspense>
  );
}
