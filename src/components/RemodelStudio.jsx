import { useEffect, useState } from 'react';
import { api } from '../api/ApiClient.js';
import { COLOR_PRESETS, MAX_COLORS, ROOM_TYPES, SAMPLE_PHOTO, STYLES } from '../data/catalog.js';
import { isHttpUrl } from '../utils/validation.js';
import { BeforeAfter } from './BeforeAfter.jsx';
import { SafeImage } from './SafeImage.jsx';

const LIGHTING = { natural: 'Natural', artificial: 'Artificial', low: 'Poca luz', unknown: 'Sin determinar' };

export function RemodelStudio({ style, onStyleChange }) {
  const [styles, setStyles] = useState(Object.keys(STYLES));
  const [roomTypes, setRoomTypes] = useState(Object.keys(ROOM_TYPES));
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO);
  const [roomType, setRoomType] = useState('bedroom');
  const [budget, setBudget] = useState('');
  const [colors, setColors] = useState([]);
  const [keepFurniture, setKeepFurniture] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.styles().then(setStyles).catch(() => {});
    api.roomTypes().then(setRoomTypes).catch(() => {});
  }, []);

  const photoValid = isHttpUrl(photoUrl.trim());

  function toggleColor(color) {
    setColors((current) => {
      if (current.includes(color)) return current.filter((c) => c !== color);
      return current.length < MAX_COLORS ? [...current, color] : current;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!photoValid) {
      setError('Ingresa un enlace válido que empiece con http:// o https://');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = photoUrl.trim();
      const response = await api.previewRemodel({
        photoUrl: url,
        roomType,
        style,
        budget: budget === '' ? null : Number(budget),
        colors,
        keepFurniture,
      });
      setResult({ ...response, photoUrl: url, style });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" id="estudio">
      <span className="kicker">Estudio</span>
      <h2 className="section-title">Diseña tu nuevo <em>espacio</em></h2>
      <p className="section-subtitle">Configura tu espacio y deja que la inteligencia artificial haga el resto.</p>

      <div className="studio">
        <form className="card studio-form" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend><i>01</i> Foto de tu espacio</legend>
            <input
              type="url"
              inputMode="url"
              maxLength={2048}
              placeholder="https://…/mi-cuarto.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              aria-invalid={!photoValid}
            />
            {photoValid ? (
              <SafeImage className="photo-preview" src={photoUrl.trim()} alt="Vista previa de tu foto" />
            ) : (
              <p className="hint">Pega el enlace de una imagen (http o https).</p>
            )}
          </fieldset>

          <fieldset>
            <legend><i>02</i> Tipo de espacio</legend>
            <div className="chips">
              {roomTypes.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`chip ${roomType === r ? 'selected' : ''}`}
                  aria-pressed={roomType === r}
                  onClick={() => setRoomType(r)}
                >
                  {ROOM_TYPES[r]?.label ?? r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend><i>03</i> Estilo</legend>
            <div className="style-grid">
              {styles.map((s) => {
                const info = STYLES[s] ?? { label: s, description: '', swatch: ['#ccc'] };
                return (
                  <button
                    type="button"
                    key={s}
                    className={`style-card ${style === s ? 'selected' : ''}`}
                    aria-pressed={style === s}
                    onClick={() => onStyleChange(s)}
                  >
                    <span className="swatch">
                      {info.swatch.map((c) => <span key={c} style={{ background: c }} />)}
                    </span>
                    <strong>{info.label}</strong>
                    <small>{info.description}</small>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="row">
            <label>
              <span><i>04</i> Presupuesto en USD <small>(opcional)</small></span>
              <input
                type="number"
                min="0"
                max="1000000"
                step="50"
                placeholder="Ej. 500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </label>
            <label className="toggle">
              <input type="checkbox" checked={keepFurniture} onChange={(e) => setKeepFurniture(e.target.checked)} />
              <span className="toggle-track" />
              <span>Conservar mis muebles</span>
            </label>
          </fieldset>

          <fieldset>
            <legend><i>05</i> Colores preferidos <small>({colors.length}/{MAX_COLORS})</small></legend>
            <div className="palette">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color ${colors.includes(c) ? 'selected' : ''}`}
                  style={{ background: c }}
                  aria-pressed={colors.includes(c)}
                  aria-label={`Color ${c}`}
                  onClick={() => toggleColor(c)}
                />
              ))}
            </div>
          </fieldset>

          {error && <p className="alert" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <><span className="spinner" /> Generando propuesta…</> : 'Generar propuesta'}
          </button>
        </form>

        <div className="card studio-result" aria-live="polite">
          {loading && (
            <div className="skeleton">
              <div className="skeleton-img" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          )}

          {!loading && !result && (
            <div className="empty">
              <span className="empty-mark" aria-hidden="true">◇</span>
              <h3>Tu propuesta aparecerá aquí</h3>
              <p>Completa los pasos y presiona “Generar propuesta”.</p>
            </div>
          )}

          {!loading && result && (
            <>
              <BeforeAfter before={result.photoUrl} after={result.imageUrl} />
              <div className="result-meta">
                <span className="badge">{STYLES[result.style]?.label ?? result.style}</span>
                {result.analysis?.lighting && (
                  <span className="badge badge-soft">Luz: {LIGHTING[result.analysis.lighting] ?? result.analysis.lighting}</span>
                )}
                <span className="badge badge-soft">IA: {result.provider}</span>
              </div>
              {result.analysis?.detectedObjects?.length > 0 && (
                <p className="detected">
                  Detectamos: {result.analysis.detectedObjects.join(', ')}
                </p>
              )}
              <h3>Sugerencias</h3>
              <ul className="suggestions">
                {result.suggestions.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
