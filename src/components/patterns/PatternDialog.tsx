import { BookOpen } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import type { PatternDoc } from '../../docs/patterns';
import { useAuth } from '../../hooks/useAuth';
import { buttonClass, Button, Modal, Skeleton } from '../ui';
import { PATTERN_DEMOS } from './demos';

const MermaidDiagram = lazy(() => import('../docs/MermaidDiagram').then((m) => ({ default: m.MermaidDiagram })));

export function PatternDemo({ id }: { id: string }) {
  const Demo = PATTERN_DEMOS[id];
  if (!Demo) return null;
  return (
    <section className="pattern-demo" aria-label="Pruébalo">
      <h4>Pruébalo</h4>
      <Demo />
    </section>
  );
}

export function PatternDialog({ pattern, onClose }: { pattern: PatternDoc | null; onClose: () => void }) {
  const { user } = useAuth();
  return (
    <Modal
      open={pattern !== null}
      onClose={onClose}
      className="pattern-dialog"
      title={pattern?.name ?? ''}
      footer={
        pattern && (
          <>
            <Link className={buttonClass({ variant: 'ghost' })} to={`/docs#patron-${pattern.id}`} onClick={onClose}>
              <BookOpen size={16} /> Ver en Documentación
            </Link>
            <Button onClick={onClose}>Cerrar</Button>
          </>
        )
      }
    >
      {pattern && (
        <>
          <div className="pattern-tags">
            <span className={`tag tag-${pattern.category.toLowerCase()}`}>{pattern.category}</span>
            <span className="tag tag-side">{pattern.side}</span>
          </div>
          <p className="pattern-dialog-summary">{pattern.summary}</p>
          <h4>Problema</h4>
          <p>{pattern.problem}</p>
          <h4>Solución</h4>
          <p>{pattern.solution}</p>
          <PatternDemo id={pattern.id} />
          {user?.role === 'admin' && (
            <p className="pattern-dialog-files">
              {pattern.files.map((file) => (
                <code key={file}>{file}</code>
              ))}
            </p>
          )}
          <Suspense fallback={<Skeleton height={180} radius="var(--radius-md)" />}>
            <MermaidDiagram code={pattern.diagram} label={`Diagrama UML de ${pattern.name}`} />
          </Suspense>
        </>
      )}
    </Modal>
  );
}
