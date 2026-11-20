import { Box, Download, Printer, RefreshCw, ShoppingBag, Wallet } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { config } from '../config';
import { useAsync } from '../hooks/useAsync';
import { notificationCenter } from '../services/notificationCenter';
import { shoppingListService } from '../services/shoppingListService';
import { budgetMessage, budgetPercent, formatQuantity, parseAmount, togglePurchased } from '../shopping/shoppingList';
import type { ShoppingExportFormat, ShoppingList as ShoppingListData } from '../types/shopping';
import { formatCurrency } from '../utils/format';
import { Badge, Button, ButtonLink, Card, PageHeader, Skeleton } from '../components/ui';

const STATUS_TONES = { none: 'neutral', under: 'success', near: 'warning', over: 'danger' } as const;
const STATUS_LABELS = {
  none: 'Sin presupuesto',
  under: 'Dentro del presupuesto',
  near: 'Cerca del límite',
  over: 'Sobre el presupuesto',
};

function BudgetCard({
  list,
  busy,
  onSave,
}: {
  list: ShoppingListData;
  busy: boolean;
  onSave: (amount: number | null) => void;
}) {
  const [text, setText] = useState(list.budget_limit ? String(list.budget_limit) : '');
  useEffect(() => setText(list.budget_limit ? String(list.budget_limit) : ''), [list.budget_limit]);
  const percent = budgetPercent(list.budget_used_ratio);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(parseAmount(text));
  }

  return (
    <Card className={`shopping-budget budget-${list.budget_status}`} aria-label="Presupuesto">
      <div className="shopping-budget-head">
        <h2>
          <Wallet size={18} /> Presupuesto
        </h2>
        <Badge tone={STATUS_TONES[list.budget_status]}>{STATUS_LABELS[list.budget_status]}</Badge>
      </div>
      <form className="shopping-budget-form no-print" onSubmit={submit}>
        <label htmlFor="budget-amount">¿Cuánto quieres gastar?</label>
        <div className="shopping-budget-row">
          <input
            id="budget-amount"
            inputMode="numeric"
            placeholder="Ej. 8000000"
            value={text}
            onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ''))}
          />
          <Button type="submit" disabled={busy}>
            Guardar
          </Button>
          {list.budget_limit !== null && (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => onSave(null)}>
              Quitar
            </Button>
          )}
        </div>
        {text && <small>{formatCurrency(Number(text))}</small>}
      </form>
      {list.budget_limit !== null && (
        <div
          className="budget-meter"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Parte del presupuesto usada"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      )}
      <p className="budget-message" aria-live="polite">
        {budgetMessage(list)}
      </p>
    </Card>
  );
}

function Totals({ list }: { list: ShoppingListData }) {
  const items = [
    { label: 'Total del diseño', value: formatCurrency(list.total) },
    { label: 'Ya comprado', value: formatCurrency(list.purchased_total) },
    { label: 'Falta por comprar', value: formatCurrency(list.pending_total) },
    { label: 'Productos', value: `${list.purchased_count} de ${list.item_count}` },
  ];
  return (
    <dl className="shopping-totals">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ShoppingList() {
  const { projectId = '' } = useParams();
  const [includeRedesign, setIncludeRedesign] = useState(false);
  const loader = useCallback(() => shoppingListService.get(projectId, includeRedesign), [projectId, includeRedesign]);
  const { data, error, retry } = useAsync(loader);
  const [list, setList] = useState<ShoppingListData | null>(null);
  const [busy, setBusy] = useState(false);
  const autoIncluded = useRef(false);

  useEffect(() => {
    if (!data) return;
    setList(data);
    // A photo-only project has nothing in 3D yet, so its redesign ideas are the useful list.
    if (!autoIncluded.current && data.sections.length === 0 && data.has_redesign && !data.include_redesign) {
      autoIncluded.current = true;
      setIncludeRedesign(true);
    }
  }, [data]);

  async function run(action: () => Promise<ShoppingListData>, success?: string) {
    setBusy(true);
    try {
      setList(await action());
      if (success) notificationCenter.notify(success, 'success');
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const saveBudget = (amount: number | null) =>
    run(
      () => shoppingListService.setBudget(projectId, amount, includeRedesign),
      amount ? 'Presupuesto guardado' : 'Quitaste el presupuesto',
    );

  const toggle = (key: string) =>
    list && run(() => shoppingListService.setPurchased(projectId, togglePurchased(list, key), includeRedesign));

  async function download(format: ShoppingExportFormat) {
    try {
      const { blob, fileName } = await shoppingListService.export(projectId, format, includeRedesign);
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    }
  }

  if (error && !list) {
    return (
      <div className="page">
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <Button variant="ghost" onClick={retry}>
            <RefreshCw size={16} /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="page" role="status" aria-label="Cargando la lista de compras">
        <Skeleton className="shopping-skeleton" radius="var(--radius-xl)" />
      </div>
    );
  }

  return (
    <div className="page shopping-page">
      <PageHeader
        eyebrow="Lista de compras"
        title={list.project_name}
        subtitle="Todo lo que lleva tu diseño, con precios del catálogo y cantidades calculadas desde el editor 3D."
        patterns={['composite-shopping', 'visitor', 'bridge-reports']}
        actions={
          <div className="shopping-actions no-print">
            <ButtonLink variant="ghost" to={`/editor/${projectId}`}>
              <Box size={18} /> Abrir en 3D
            </ButtonLink>
            <Button variant="ghost" onClick={() => download('csv')}>
              <Download size={18} /> Descargar CSV
            </Button>
            <Button onClick={() => window.print()}>
              <Printer size={18} /> Imprimir o PDF
            </Button>
          </div>
        }
      />

      <div className="shopping-summary">
        <BudgetCard list={list} busy={busy} onSave={saveBudget} />
        <Card className="shopping-overview">
          <Totals list={list} />
          {list.has_redesign && (
            <label className="shopping-toggle no-print">
              <input
                type="checkbox"
                checked={includeRedesign}
                disabled={busy}
                onChange={(e) => setIncludeRedesign(e.target.checked)}
              />
              Sumar las ideas del último rediseño con IA
            </label>
          )}
        </Card>
      </div>

      {list.sections.length === 0 ? (
        <EmptyState
          title="Tu lista está vacía"
          description="Agrega muebles, acabados o complementos en el editor 3D y aparecerán aquí con su precio."
          action={
            <ButtonLink to={`/editor/${projectId}`}>
              <Box size={18} /> Ir al editor 3D
            </ButtonLink>
          }
        />
      ) : (
        list.sections.map((section) => (
          <Card as="section" key={section.key} className="shopping-section" aria-label={section.title}>
            <header className="shopping-section-head">
              <h2>
                <ShoppingBag size={18} /> {section.title}
              </h2>
              <strong>{formatCurrency(section.total)}</strong>
            </header>
            <ul className="shopping-lines">
              {section.lines.map((line) => (
                <li key={line.key} className={line.purchased ? 'is-purchased' : undefined}>
                  <label className="shopping-check">
                    <input
                      type="checkbox"
                      checked={line.purchased}
                      disabled={busy}
                      onChange={() => toggle(line.key)}
                      aria-label={`Marcar ${line.title} como comprado`}
                    />
                  </label>
                  <div className="shopping-line-text">
                    <span className="shopping-line-title">{line.title}</span>
                    {line.detail && <span className="shopping-line-detail">{line.detail}</span>}
                  </div>
                  <span className="shopping-line-qty">
                    {formatQuantity(line.quantity, line.unit)} × {formatCurrency(line.unit_price)}
                  </span>
                  <strong className="shopping-line-total">{formatCurrency(line.total)}</strong>
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
      <p className="shopping-note">
        Los precios son estimados del catálogo de {config.appName} y pueden cambiar en cada tienda.
      </p>
    </div>
  );
}
