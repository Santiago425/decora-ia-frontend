import { ChatPanel } from '../components/assistant/ChatPanel';
import { config } from '../config';
import { PageHeader } from '../components/ui';

export default function Assistant() {
  return (
    <div className="page assistant-page">
      <PageHeader
        title={config.assistantName}
        subtitle="Escríbele o háblale. Entiende lo que necesitas y lo hace por ti dentro de la app."
        patterns={['strategy-assistant', 'chain-assistant', 'adapter-voice', 'observer']}
      />
      <ChatPanel />
    </div>
  );
}
