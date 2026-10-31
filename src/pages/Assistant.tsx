import { ChatPanel } from '../components/assistant/ChatPanel';
import { config } from '../config';

export default function Assistant() {
  return (
    <div className="page assistant-page">
      <header className="page-header">
        <h1>{config.assistantName}</h1>
        <p className="page-subtitle">Escríbele o háblale. Entiende lo que necesitas y lo hace por ti dentro de la app.</p>
      </header>
      <ChatPanel />
    </div>
  );
}
