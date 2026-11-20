import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PagerProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pager({ page, total, pageSize, onChange }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return (
    <nav className="pager" aria-label="Páginas">
      <span className="pager-range">
        {first}–{last} de {total}
      </span>
      <button
        type="button"
        className="icon-button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <span>
        Página {page} de {pages}
      </span>
      <button
        type="button"
        className="icon-button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Página siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
