import { useEffect, useState } from 'react';
import { api } from '../api/ApiClient.js';

const STYLE_LABELS = {
  modern: 'Moderno',
  nordic: 'Nórdico',
  industrial: 'Industrial',
  bohemian: 'Bohemio',
  minimalist: 'Minimalista',
};

export function RemodelDemo() {
  const [styles, setStyles] = useState(Object.keys(STYLE_LABELS));
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85');
  const [style, setStyle] = useState('nordic');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.styles().then(setStyles).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setResult(await api.previewRemodel({ photoUrl, style }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="demo">
      <h2>Prueba la remodelación</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Foto de tu cuarto (URL)
          <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
        </label>
        <label>
          Estilo
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            {styles.map((s) => (
              <option key={s} value={s}>{STYLE_LABELS[s] ?? s}</option>
            ))}
          </select>
        </label>
        <button disabled={loading}>{loading ? 'Generando…' : 'Remodelar'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <figure>
            <img src={photoUrl} alt="Cuarto original" />
            <figcaption>Antes</figcaption>
          </figure>
          <figure>
            <img src={result.imageUrl} alt="Propuesta de la IA" />
            <figcaption>Propuesta ({result.provider})</figcaption>
          </figure>
          <ul>
            {result.suggestions.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
