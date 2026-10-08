import { useEffect, useState } from 'react';
import { api } from './api/ApiClient.js';
import { StatusCard } from './components/StatusCard.jsx';
import { RemodelDemo } from './components/RemodelDemo.jsx';

export default function App() {
  const [backend, setBackend] = useState({ state: 'loading', detail: 'Conectando…' });
  const [database, setDatabase] = useState({ state: 'loading', detail: 'Conectando…' });

  useEffect(() => {
    api.hello()
      .then((r) => setBackend({ state: 'up', detail: r.message }))
      .catch((e) => setBackend({ state: 'down', detail: e.message }));
    api.health()
      .then((r) => setDatabase({ state: 'up', detail: `PostgreSQL en línea · ${r.styles} estilos cargados` }))
      .catch((e) => setDatabase({ state: 'down', detail: e.message }));
  }, []);

  return (
    <main>
      <header className="hero">
        <span className="tag">Proyecto final · Patrones de Diseño</span>
        <h1>DecoraIA</h1>
        <p>Toma una foto de tu cuarto y deja que la inteligencia artificial te proponga cómo remodelarlo.</p>
      </header>

      <section className="status">
        <StatusCard title="Frontend" state="up" detail="Hello World desde DecoraIA" />
        <StatusCard title="Backend" {...backend} />
        <StatusCard title="Base de datos" {...database} />
      </section>

      <RemodelDemo />

      <footer>Santiago Campoverde · Never Melo</footer>
    </main>
  );
}
