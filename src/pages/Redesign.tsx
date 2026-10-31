import { AlertTriangle, Download, FolderHeart, RefreshCw, Shuffle, Sparkles, WandSparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImageProxy } from '../components/ImageProxy';
import { BeforeAfter } from '../components/redesign/BeforeAfter';
import { PhotoPicker } from '../components/redesign/PhotoPicker';
import { RedesignProgress } from '../components/redesign/RedesignProgress';
import { SuggestionsPanel } from '../components/redesign/SuggestionsPanel';
import { config } from '../config';
import { useAsync } from '../hooks/useAsync';
import { catalogService } from '../services/catalogService';
import { notificationCenter } from '../services/notificationCenter';
import { redesignService } from '../services/redesignService';
import type { Redesign as RedesignResult } from '../types/redesign';
import { formatCurrency } from '../utils/format';
import { shrinkImage } from '../utils/image';
import { downloadImage, resolveMediaUrl } from '../utils/media';

const TIER_LABELS = { economic: 'Económico', standard: 'Gama media', premium: 'Premium' };

export default function Redesign() {
  const [params] = useSearchParams();
  const catalog = useAsync(
    useCallback(() => Promise.all([catalogService.roomTypes(), catalogService.styles()]), []),
  );
  const [roomTypes, styles] = catalog.data ?? [[], []];

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [roomType, setRoomType] = useState(params.get('room_type') ?? '');
  const [style, setStyle] = useState(params.get('style') ?? '');
  const [paletteId, setPaletteId] = useState<number | null>(null);
  const [budget, setBudget] = useState(params.get('budget') ?? '');
  const [keepStructure, setKeepStructure] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RedesignResult | null>(null);

  useEffect(() => {
    if (!roomType && roomTypes.length) setRoomType(roomTypes[0].slug);
    if (!style && styles.length) setStyle(styles[0].slug);
  }, [roomTypes, styles, roomType, style]);

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const selectedStyle = styles.find((s) => s.slug === style);
  const palettes = useMemo(() => selectedStyle?.palettes ?? [], [selectedStyle]);
  const palette = palettes.find((p) => p.id === paletteId);

  useEffect(() => setPaletteId(palettes[0]?.id ?? null), [palettes]);

  async function run(action: () => Promise<RedesignResult>) {
    setBusy(true);
    setError('');
    try {
      const redesign = await action();
      setResult(redesign);
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
    const amount = budget.trim() === '' ? null : Number(budget.replace(/\D/g, ''));
    run(async () =>
      redesignService.create({
        photo: await shrinkImage(photo, config.maxPhotoSide),
        roomType,
        style,
        palette: palette?.colors ?? [],
        budget: amount,
        keepStructure,
      }),
    );
  }

  function startOver() {
    setResult(null);
    setPhoto(null);
    setError('');
  }

  const before = resolveMediaUrl(result?.original_image_url);
  const after = resolveMediaUrl(result?.result_image_url);

  return (
    <div className="page redesign-page">
      <header className="page-header">
        <h1>Rediseño con foto</h1>
        <Link to="/assistant" className="lumi-hint">
          <Sparkles size={16} /> O cuéntaselo a {config.assistantName}
        </Link>
      </header>

      {busy && <RedesignProgress preview={preview ?? before} />}

      {!busy && result?.status === 'ready' && before && after && (
        <section className="redesign-result">
          <div className="result-visual">
            <BeforeAfter before={before} after={after} />
            <div className="result-actions">
              <button className="button button-primary" onClick={() => run(() => redesignService.variation(result.id))}>
                <Shuffle size={18} /> Generar variación
              </button>
              <button
                className="button button-ghost"
                onClick={() => downloadImage(after, `${result.project_name}.jpg`).catch((e) => notificationCenter.notify(e.message, 'error'))}
              >
                <Download size={18} /> Descargar
              </button>
              <button className="button button-ghost" onClick={startOver}>
                <WandSparkles size={18} /> Nueva foto
              </button>
            </div>
          </div>
          <aside className="result-side">
            <div className="result-meta">
              <span className="badge">{result.style?.name}</span>
              <span className="badge badge-soft">{result.room_type?.name}</span>
              <span className="badge badge-soft">{TIER_LABELS[result.budget_tier]}</span>
            </div>
            <Link to="/projects" className="saved-note">
              <FolderHeart size={16} /> Guardado en «{result.project_name}»
            </Link>
            <SuggestionsPanel suggestions={result.suggestions} total={result.estimated_total} />
          </aside>
        </section>
      )}

      {!busy && result?.status === 'error' && (
        <div className="redesign-error">
          <AlertTriangle size={28} />
          <div>
            <strong>No pudimos terminar tu rediseño</strong>
            <p>{result.error_message}</p>
          </div>
          <button className="button button-primary" onClick={() => run(() => redesignService.retry(result.id))}>
            <RefreshCw size={18} /> Reintentar
          </button>
        </div>
      )}

      {!busy && !result && (
        <form className="redesign-form" onSubmit={handleSubmit} noValidate>
          <div className="redesign-photo">
            <PhotoPicker file={photo} onChange={setPhoto} onInvalid={setError} />
          </div>

          <div className="redesign-options">
            <fieldset>
              <legend>Habitación</legend>
              <div className="chips">
                {roomTypes.map((room) => (
                  <button
                    key={room.slug}
                    type="button"
                    className={`chip ${roomType === room.slug ? 'selected' : ''}`}
                    aria-pressed={roomType === room.slug}
                    onClick={() => setRoomType(room.slug)}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Estilo</legend>
              <div className="style-options">
                {styles.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    className={`style-option ${style === item.slug ? 'selected' : ''}`}
                    aria-pressed={style === item.slug}
                    onClick={() => setStyle(item.slug)}
                  >
                    <ImageProxy src={item.image_url} alt="" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {palettes.length > 0 && (
              <fieldset>
                <legend>Paleta de colores</legend>
                <div className="palette-options">
                  {palettes.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`palette-option ${paletteId === option.id ? 'selected' : ''}`}
                      aria-pressed={paletteId === option.id}
                      onClick={() => setPaletteId(paletteId === option.id ? null : option.id)}
                    >
                      <span className="palette-dots">
                        {option.colors.map((c) => (
                          <i key={c} style={{ background: c }} />
                        ))}
                      </span>
                      {option.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="option-row">
              <label className="budget-field">
                <span>Presupuesto ({config.currency})</span>
                <input
                  inputMode="numeric"
                  placeholder="Opcional"
                  value={budget ? formatCurrency(Number(budget.replace(/\D/g, ''))) : ''}
                  onChange={(e) => setBudget(e.target.value.replace(/\D/g, '').slice(0, 12))}
                />
              </label>
              <label className="switch">
                <input type="checkbox" checked={keepStructure} onChange={(e) => setKeepStructure(e.target.checked)} />
                <span className="switch-track" />
                <span>Conservar paredes, ventanas y piso</span>
              </label>
            </div>

            {(error || catalog.error) && (
              <p className="form-alert" role="alert">
                {error || catalog.error}
              </p>
            )}

            <button className="button button-primary button-block button-large" disabled={!photo || catalog.loading}>
              <WandSparkles size={20} /> Rediseñar mi espacio
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
