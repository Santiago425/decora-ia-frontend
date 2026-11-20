import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './styles/tokens.css';
import './styles/global.css';
import './styles/ui.css';
import './styles/motion.css';
import './styles/auth.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/redesign.css';
import './styles/editor.css';
import './styles/shopping.css';
import './styles/assistant.css';
import './styles/projects.css';
import './styles/admin.css';
import './styles/docs.css';
import './styles/patterns.css';
import './styles/intro.css';
import './styles/glass.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Intro } from './components/Intro';
import { config } from './config';

document.title = config.appName;

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
    <Intro />
  </StrictMode>,
);
