import { Puzzle } from 'lucide-react';
import { patternMode, usePatternMode } from '../../patterns/patternMode';

export function PatternModeToggle({ className, tabIndex }: { className?: string; tabIndex?: number }) {
  const enabled = usePatternMode();
  return (
    <label
      className={['pattern-toggle', className].filter(Boolean).join(' ')}
      title="Muestra qué patrón hay detrás de cada parte"
    >
      <Puzzle size={18} aria-hidden="true" />
      <span>Modo patrones</span>
      <span className="toggle">
        <input type="checkbox" checked={enabled} onChange={patternMode.toggle} tabIndex={tabIndex} />
        <span />
      </span>
    </label>
  );
}
