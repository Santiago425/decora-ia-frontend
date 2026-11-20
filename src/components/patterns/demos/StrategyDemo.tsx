import { useState } from 'react';
import { SORT_STRATEGIES, type SortKey } from '../../../projects/projectQuery';
import type { ProjectSummary } from '../../../types/dashboard';
import { formatCurrency } from '../../../utils/format';
import { Chip, ChipGroup } from '../../ui';

const SAMPLE = [
  { name: 'Sala nórdica', estimated_budget: '1800', updated_at: '2026-11-18', created_at: '2026-10-02' },
  { name: 'Baño industrial', estimated_budget: '950', updated_at: '2026-11-19', created_at: '2026-11-10' },
  { name: 'Dormitorio boho', estimated_budget: '2600', updated_at: '2026-11-12', created_at: '2026-09-21' },
] as ProjectSummary[];

export function StrategyDemo() {
  const [sort, setSort] = useState<SortKey>('recent');
  const sorted = [...SAMPLE].sort(SORT_STRATEGIES[sort].compare);
  return (
    <div className="demo">
      <ChipGroup label="Estrategia de orden" className="chips-scroll">
        {(Object.keys(SORT_STRATEGIES) as SortKey[]).map((key) => (
          <Chip key={key} className="chip-sm" selected={sort === key} onClick={() => setSort(key)}>
            {SORT_STRATEGIES[key].label}
          </Chip>
        ))}
      </ChipGroup>
      <ol className="demo-list">
        {sorted.map((project) => (
          <li key={project.name}>
            <strong>{project.name}</strong>
            <small>{formatCurrency(Number(project.estimated_budget))}</small>
          </li>
        ))}
      </ol>
      <p className="demo-note">La lista no cambia de código: solo se cambia el objeto que compara.</p>
    </div>
  );
}
