import {
  AlertTriangle,
  Box,
  Brush,
  Download,
  FolderHeart,
  Images,
  RefreshCw,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImageProxy } from '../components/ImageProxy';
import { BeforeAfter } from '../components/redesign/BeforeAfter';
import { EditPanel } from '../components/redesign/EditPanel';
import { InspirationPanel } from '../components/redesign/InspirationPanel';
import { PhotoPicker } from '../components/redesign/PhotoPicker';
import { RedesignOptions, type RedesignChoices } from '../components/redesign/RedesignOptions';
import { RedesignProgress } from '../components/redesign/RedesignProgress';
import { RedesignSummary } from '../components/redesign/RedesignSummary';
import { RedesignVersions } from '../components/redesign/RedesignVersions';
import { SuggestionsPanel } from '../components/redesign/SuggestionsPanel';
import { config } from '../config';
import { useAsync } from '../hooks/useAsync';
import { preloadHandlers } from '../routes/pages';
import { catalogService } from '../services/catalogService';
import { notificationCenter } from '../services/notificationCenter';
import { redesignService } from '../services/redesignService';
import type { DesignStyle } from '../types/catalog';
import type { Redesign as RedesignResult } from '../types/redesign';
import { formatCurrency } from '../utils/format';
import { shrinkImage } from '../utils/image';
import { downloadImage, resolveMediaUrl } from '../utils/media';
import { Badge, Button, PageHeader, Skeleton } from '../components/ui';

const TIER_LABELS = { economic: 'Económico', standard: 'Gama media', premium: 'Premium' };

const toAmount = (budget: string) => (budget.trim() === '' ? null : Number(budget));

function paletteColors(styles: DesignStyle[], choices: RedesignChoices) {
  const palettes = styles.find((s) => s.slug === choices.style)?.palettes ?? [];
  return palettes.find((p) => p.id === choices.paletteId)?.colors ?? [];
}

function choicesFrom(redesign: RedesignResult, styles: DesignStyle[]): RedesignChoices {
  const style = redesign.style?.slug ?? styles[0]?.slug ?? '';
  const palettes = styles.find((s) => s.slug === style)?.palettes ?? [];
  const palette = palettes.find((p) => p.colors.join() === redesign.palette.join());
  return {
    style,
    paletteId: palette?.id ?? null,
    budget: redesign.budget ? String(Math.round(Number(redesign.budget))) : '',
    keepStructure: redesign.keep_structure,
    keepItems: redesign.keep_items ?? '',
  };
}

export default function Redesign() {
  const [params, setParams] = useSearchParams();
  const projectId = params.get('project');
  const catalog = useAsync(useCallback(() => Promise.all([catalogService.roomTypes(), catalogService.styles()]), []));
  const [roomTypes, styles] = catalog.data ?? [[], []];

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [roomType, setRoomType] = useState(params.get('room_type') ?? '');
  const [choices, setChoices] = useState<RedesignChoices>({
    style: params.get('style') ?? '',
    paletteId: null,
    budget: (params.get('budget') ?? '').replace(/\D/g, ''),
    keepStructure: true,
    keepItems: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RedesignResult | null>(null);
  const [versions, setVersions] = useState<RedesignResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [tuning, setTuning] = useState<RedesignChoices | null>(null);
  const [editing, setEditing] = useState(false);
  const [inspiring, setInspiring] = useState(false);
  const tuningRef = useRef<HTMLFormElement>(null);
  const isTuning = tuning !== null;
  const loadedProject = versions[0]?.project_id;

  useEffect(() => {
    if (!roomType && roomTypes.length) setRoomType(roomTypes[0].slug);
  }, [roomTypes, roomType]);

  useEffect(() => {
    if (!styles.length) return;
    setChoices((current) => {
      if (current.paletteId !== null) return current;
      const style = styles.find((s) => s.slug === current.style) ?? styles[0];
      return { ...current, style: style.slug, paletteId: style.palettes[0]?.id ?? null };
    });
  }, [styles]);

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    if (!projectId || projectId === loadedProject) return;
    let active = true;
    setLoadingHistory(true);
    redesignService
      .history(projectId)
      .then((items) => {
        if (!active) return;
        setVersions(items);
        setResult(items[0] ?? null);
      })
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoadingHistory(false));
    return () => {
      active = false;
    };
  }, [projectId, loadedProject]);

  useEffect(() => {
    if (isTuning) tuningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isTuning]);

  const selectedStyle = styles.find((s) => s.slug === choices.style);
  const palette = selectedStyle?.palettes.find((p) => p.id === choices.paletteId);

  async function run(action: () => Promise<RedesignResult>) {
    setBusy(true);
    setError('');
    try {
      const redesign = await action();
      setResult(redesign);
      setTuning(null);
      setEditing(false);
      setInspiring(false);
      setVersions((items) =>
        items.some((item) => item.id === redesign.id)
          ? items.map((item) => (item.id === redesign.id ? redesign : item))
          : [redesign, ...items.filter((item) => item.project_id === redesign.project_id)],
      );
      setParams({ project: redesign.project_id }, { replace: true });
      if (redesign.status === 'ready') notificationCenter.notify('¡Tu rediseño está listo!', 'success');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!photo) return setError('Primero sube o toma una foto de tu espacio');
    run(async () =>
      redesignService.create({
        photo: await shrinkImage(photo, config.maxPhotoSide),
        roomType,
        style: choices.style,
        palette: palette?.colors ?? [],
        budget: toAmount(choices.budget),
        keepStructure: choices.keepStructure,
        keepItems: choices.keepItems,
      }),
    );
  }

  function createVariation(source: RedesignResult, options: RedesignChoices) {
    run(() =>
      redesignService.variation(source.id, {
        style: options.style,
        palette: paletteColors(styles, options),
        budget: toAmount(options.budget),
        keep_structure: options.keepStructure,
        keep_items: options.keepStructure ? options.keepItems.trim() || null : null,
      }),
    );
  }

  function startOver() {
    setResult(null);
    setVersions([]);
    setTuning(null);
    setEditing(false);
    setInspiring(false);
    setPhoto(null);
    setError('');
    setParams({}, { replace: true });
  }

  const before = resolveMediaUrl(result?.original_image_url);
  const after = resolveMediaUrl(result?.result_image_url);
  const inspirationUrl = resolveMediaUrl(result?.inspiration_image_url);
  const alert = (error || catalog.error) && (
    <p className="form-alert" role="alert">
      {error || catalog.error}
    </p>
  );

  return (
    <div className="page redesign-page">
      <PageHeader
        title={result ? result.project_name : 'Rediseño con foto'}
        patterns={[
          'facade',
          'builder-redesign',
          'chain-images',
          'strategy-budget',
          'strategy-edits',
          'adapter-inspiration',
        ]}
        actions={
          <Link to="/assistant" className="lumi-hint">
            <Sparkles size={16} /> O cuéntaselo a {config.assistantName}
          </Link>
        }
      />

      {busy && <RedesignProgress preview={preview ?? before} />}

      {!busy && loadingHistory && !result && (
        <div className="redesign-result" aria-busy="true">
          <Skeleton className="redesign-skeleton" />
        </div>
      )}

      {!busy && result?.status === 'ready' && before && after && (
        <section className="redesign-result">
          <div className="result-visual">
            <BeforeAfter before={before} after={after} />
            <RedesignVersions versions={versions} current={result.id} onSelect={setResult} />
            <div className="result-actions">
              <Button
                onClick={() => {
                  setEditing(false);
                  setInspiring(false);
                  setTuning(tuning ? null : choicesFrom(result, styles));
                }}
                aria-expanded={!!tuning}
              >
                <SlidersHorizontal size={18} /> Probar con otras opciones
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setTuning(null);
                  setInspiring(false);
                  setEditing(!editing);
                }}
                aria-expanded={editing}
              >
                <Brush size={18} /> Editar una parte
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setTuning(null);
                  setEditing(false);
                  setInspiring(!inspiring);
                }}
                aria-expanded={inspiring}
              >
                <Images size={18} /> Usar inspiración
              </Button>
              <Button variant="ghost" onClick={() => run(() => redesignService.variation(result.id))}>
                <Shuffle size={18} /> Otra versión igual
              </Button>
              <button
                className="button button-ghost"
                onClick={() =>
                  downloadImage(after, `${result.project_name}.jpg`).catch((e) =>
                    notificationCenter.notify(e.message, 'error'),
                  )
                }
              >
                <Download size={18} /> Descargar
              </button>
              <Button variant="ghost" onClick={startOver}>
                <WandSparkles size={18} /> Nueva foto
              </Button>
            </div>

            {tuning && (
              <form
                ref={tuningRef}
                className="redesign-tuning"
                onSubmit={(event) => {
                  event.preventDefault();
                  createVariation(result, tuning);
                }}
              >
                <header>
                  <div>
                    <h2>Prueba otra versión</h2>
                    <p>Usamos la misma foto. Cambia lo que quieras y generamos una imagen nueva.</p>
                  </div>
                  <button type="button" className="icon-button" onClick={() => setTuning(null)} aria-label="Cerrar">
                    <X size={18} />
                  </button>
                </header>
                <RedesignOptions
                  styles={styles}
                  value={tuning}
                  onChange={(changes) => setTuning({ ...tuning, ...changes })}
                />
                {alert}
                <Button type="submit" size="lg" block>
                  <WandSparkles size={20} /> Generar nueva versión
                </Button>
              </form>
            )}
            {editing && (
              <EditPanel
                colors={result.suggestions.colors ?? []}
                alert={alert}
                onApply={(tool, values) => run(() => redesignService.applyEdit(result.id, tool, values))}
                onClose={() => setEditing(false)}
              />
            )}
            {inspiring && (
              <InspirationPanel
                alert={alert}
                onInvalid={setError}
                onApply={(picture) =>
                  run(async () =>
                    redesignService.applyInspiration(result.id, await shrinkImage(picture, config.maxPhotoSide)),
                  )
                }
                onClose={() => setInspiring(false)}
              />
            )}
            {!tuning && !editing && !inspiring && alert}
          </div>
          <aside className="result-side">
            <div className="result-meta">
              <Badge>{result.style?.name}</Badge>
              <Badge tone="neutral">{result.room_type?.name}</Badge>
              <Badge tone="neutral">{TIER_LABELS[result.budget_tier]}</Badge>
            </div>
            <Link to="/projects" className="saved-note">
              <FolderHeart size={16} /> Guardado en «{result.project_name}»
            </Link>
            <Link
              to={`/editor/${result.project_id}`}
              {...preloadHandlers(`/editor/${result.project_id}`)}
              className="editor-note"
            >
              <Box size={16} /> Seguir en el editor 3D
            </Link>
            {inspirationUrl && (
              <figure className="inspiration-note">
                <img src={inspirationUrl} alt="Foto de inspiración usada" />
                <figcaption>
                  <strong>Inspirado en tu foto</strong>
                  {result.inspiration_name}
                </figcaption>
              </figure>
            )}
            <SuggestionsPanel suggestions={result.suggestions} total={result.estimated_total} />
          </aside>
        </section>
      )}

      {!busy && result?.status === 'error' && (
        <div className="redesign-error">
          <AlertTriangle size={28} />
          <div>
            <strong>No pudimos terminar tu rediseño</strong>
            <p>{error || result.error_message}</p>
          </div>
          <Button onClick={() => run(() => redesignService.retry(result.id))}>
            <RefreshCw size={18} /> Reintentar
          </Button>
          {versions.length > 1 && <RedesignVersions versions={versions} current={result.id} onSelect={setResult} />}
        </div>
      )}

      {!busy && !loadingHistory && !result && (
        <form className="redesign-form" onSubmit={handleSubmit} noValidate>
          <div className="redesign-photo">
            <PhotoPicker file={photo} onChange={setPhoto} onInvalid={setError} />
            <RedesignSummary
              hasPhoto={Boolean(photo)}
              roomName={roomTypes.find((room) => room.slug === roomType)?.name}
              styleName={selectedStyle?.name}
              paletteName={palette?.name}
              budget={choices.budget ? formatCurrency(Number(choices.budget)) : ''}
            />
          </div>

          <div className="redesign-options">
            <fieldset>
              <legend>Habitación</legend>
              <div className="room-options">
                {roomTypes.map((room) => (
                  <button
                    key={room.slug}
                    type="button"
                    className={`room-option ${roomType === room.slug ? 'selected' : ''}`}
                    aria-pressed={roomType === room.slug}
                    onClick={() => setRoomType(room.slug)}
                  >
                    {room.cover_image_url && <ImageProxy src={room.cover_image_url} alt="" />}
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <RedesignOptions
              styles={styles}
              value={choices}
              onChange={(changes) => setChoices((current) => ({ ...current, ...changes }))}
            />

            {alert}

            <div className="redesign-submit">
              <Button size="lg" block type="submit" disabled={!photo || catalog.loading}>
                <WandSparkles size={20} /> Rediseñar mi espacio
              </Button>
              {!photo && <small className="submit-hint">Sube una foto para continuar</small>}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
