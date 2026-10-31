import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './styles/tokens.css';
import './styles/global.css';
import './styles/auth.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/redesign.css';
import './styles/editor.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { config } from './config';

document.title = config.appName;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
