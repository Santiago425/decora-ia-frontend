import { useEffect, useState } from 'react';
import { api } from './api/ApiClient.js';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { HowItWorks } from './components/HowItWorks.jsx';
import { RemodelStudio } from './components/RemodelStudio.jsx';
import { PatternsSection } from './components/PatternsSection.jsx';
import { SystemStatus } from './components/SystemStatus.jsx';

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
    <>
      <Navbar apiState={backend.state} />
      <main>
        <Hero />
        <HowItWorks />
        <RemodelStudio />
        <PatternsSection />
        <SystemStatus backend={backend} database={database} />
      </main>
      <footer>
        <strong>DecoraIA</strong> · Santiago Campoverde · Never Melo
      </footer>
    </>
  );
}
