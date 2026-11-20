import { Puzzle } from 'lucide-react';
import { useState } from 'react';
import { PATTERNS, type PatternDoc } from '../../docs/patterns';
import { PatternDialog } from './PatternDialog';

const BY_ID = new Map(PATTERNS.map((pattern) => [pattern.id, pattern]));

export default function PatternBadgeList({ ids, className }: { ids: string[]; className?: string }) {
  const [open, setOpen] = useState<PatternDoc | null>(null);
  const patterns = ids.map((id) => BY_ID.get(id)).filter((p): p is PatternDoc => Boolean(p));
  return (
    <span className={['pattern-badges', className].filter(Boolean).join(' ')}>
      {patterns.map((pattern) => (
        <button
          key={pattern.id}
          type="button"
          className="pattern-badge"
          onClick={() => setOpen(pattern)}
          aria-label={`Patrón ${pattern.name}: ${pattern.summary}`}
        >
          <Puzzle size={12} aria-hidden="true" /> {pattern.name}
        </button>
      ))}
      <PatternDialog pattern={open} onClose={() => setOpen(null)} />
    </span>
  );
}
