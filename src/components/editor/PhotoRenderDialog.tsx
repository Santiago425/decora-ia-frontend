import { Download, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sceneRenderService } from '../../services/sceneRenderService';
import type { SceneRender } from '../../types/project';
import { formatRelativeTime } from '../../utils/format';
import { downloadImage, resolveMediaUrl } from '../../utils/media';
import { BeforeAfter } from '../redesign/BeforeAfter';
import { Button, Modal } from '../ui';

interface PhotoRenderDialogProps {
  open: boolean;
  projectId: string;
  projectName: string;
  /** Saves the scene and returns a clean capture of the current 3D view. */
  prepareCapture: () => Promise<Blob | null>;
  onClose: () => void;
}

type Phase = 'idle' | 'working' | 'error';

export function PhotoRenderDialog({ open, projectId, projectName, prepareCapture, onClose }: PhotoRenderDialogProps) {
  const [renders, setRenders] = useState<SceneRender[]>([]);
  const [shown, setShown] = useState<SceneRender | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    sceneRenderService
      .list(projectId)
      .then((list) => {
        if (!active) return;
        setRenders(list);
        setShown((current) => current ?? list.find((render) => render.status === 'ready') ?? null);
      })
      .catch(() => active && setRenders([]));
    return () => {
      active = false;
    };
  }, [open, projectId]);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function create() {
    setPhase('working');
    setMessage('');
    try {
      const capture = await prepareCapture();
      if (!capture) throw new Error('No pudimos tomar la vista 3D. Inténtalo de nuevo');
      setPreview(URL.createObjectURL(capture));
      const render = await sceneRenderService.create(projectId, capture);
      setRenders((current) => [render, ...current]);
      if (render.status === 'ready') {
        setShown(render);
        setPhase('idle');
      } else {
        setMessage(render.error_message ?? 'No pudimos crear la foto. Inténtalo de nuevo');
        setPhase('error');
      }
    } catch (error) {
      setMessage((error as Error).message);
      setPhase('error');
    }
  }

  const before = resolveMediaUrl(shown?.capture_image_url);
  const after = resolveMediaUrl(shown?.result_image_url);
  const ready = renders.filter((render) => render.status === 'ready' && render.result_image_url);
  const working = phase === 'working';

  return (
    <Modal
      open={open}
      title="Del 3D a foto real"
      onClose={onClose}
      className="photo-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {after && !working && (
            <Button
              variant="ghost"
              onClick={() =>
                downloadImage(after, `${projectName} foto real.jpg`).catch((error) => setMessage(error.message))
              }
            >
              <Download size={16} /> Descargar
            </Button>
          )}
          <Button onClick={create} disabled={working}>
            {working ? (
              <Loader2 size={16} className="spin" />
            ) : phase === 'error' ? (
              <RefreshCw size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {working ? 'Creando…' : phase === 'error' ? 'Intentar de nuevo' : shown ? 'Crear otra' : 'Crear foto real'}
          </Button>
        </>
      }
    >
      <p className="photo-intro">
        Tomamos la vista 3D tal como la ves, con sus muebles, acabados y la hora del día, y la convertimos en una foto
        realista. Gira la cámara antes para elegir el ángulo.
      </p>
      <div className="photo-stage">
        {working && preview ? (
          <img src={preview} alt="Vista 3D que se está convirtiendo en foto" />
        ) : before && after ? (
          <BeforeAfter before={before} after={after} />
        ) : (
          preview && <img src={preview} alt="Última vista 3D enviada" />
        )}
        {working && (
          <div className="photo-working" role="status">
            <Loader2 size={18} aria-hidden="true" /> Creando la foto, puede tardar hasta un minuto…
          </div>
        )}
      </div>
      {phase === 'error' && message && (
        <p className="photo-error" role="alert">
          {message}
        </p>
      )}
      {ready.length > 1 && (
        <div className="photo-history" aria-label="Fotos anteriores">
          {ready.map((render) => (
            <button
              key={render.id}
              aria-pressed={shown?.id === render.id}
              aria-label={`Ver la foto de ${formatRelativeTime(render.created_at)}`}
              onClick={() => {
                setShown(render);
                setPhase('idle');
              }}
            >
              <img src={resolveMediaUrl(render.result_image_url) ?? ''} alt="" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
