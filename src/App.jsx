import { useEffect, useState } from 'react';
import { api } from './api/ApiClient.js';
import { Splash } from './components/Splash.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { StyleGallery } from './components/StyleGallery.jsx';
import { HowItWorks } from './components/HowItWorks.jsx';
import { RemodelStudio } from './components/RemodelStudio.jsx';
import { Footer } from './components/Footer.jsx';
import { AuthModal } from './components/AuthModal.jsx';

export default function App() {
  const [backend, setBackend] = useState({ state: 'loading', detail: 'Conectando…' });
  const [database, setDatabase] = useState({ state: 'loading', detail: 'Conectando…' });
  const [style, setStyle] = useState('nordic');

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
      <Splash />
      <Navbar apiState={backend.state} />
      <AuthModal />
      <main>
        <Hero />
        <StyleGallery selected={style} onSelect={setStyle} />
        <RemodelStudio style={style} onStyleChange={setStyle} />
        <HowItWorks />
      </main>
      <Footer
        services={[
          { title: 'App', state: 'up', detail: 'Hello World desde DecoraIA' },
          { title: 'Servidor', ...backend },
          { title: 'Base de datos', ...database },
        ]}
      />
    </>
  );
}
