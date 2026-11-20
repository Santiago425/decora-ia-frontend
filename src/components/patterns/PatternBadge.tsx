import { lazy, Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePatternMode } from '../../patterns/patternMode';

const PatternBadgeList = lazy(() => import('./PatternBadgeList'));

/** Shows which design patterns power the piece of UI next to it while an administrator has "Modo patrones" on. */
export function PatternBadge({ ids, className }: { ids: string[]; className?: string }) {
  const enabled = usePatternMode();
  const { user } = useAuth();
  if (!enabled || user?.role !== 'admin') return null;
  return (
    <Suspense fallback={null}>
      <PatternBadgeList ids={ids} className={className} />
    </Suspense>
  );
}
