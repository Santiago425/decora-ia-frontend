import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../assistant/chatStore';
import { config } from '../../config';
import { ChatPanel } from './ChatPanel';
import { LumiOrb } from './LumiOrb';

export function LumiLauncher() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const chat = useChat();
  const onAssistantPage = location.pathname.startsWith('/assistant');
  const inEditor = location.pathname.startsWith('/editor/');

  useEffect(() => {
    if (!location.pathname.startsWith('/editor/')) setOpen(false);
  }, [location.pathname]);

  if (onAssistantPage) return null;

  return (
    <>
      {open && (
        <div className="lumi-drawer" role="dialog" aria-label={config.assistantName}>
          <ChatPanel compact onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <button className={`lumi-launcher ${inEditor ? 'in-editor' : ''}`} onClick={() => setOpen(true)} aria-label={`Hablar con ${config.assistantName}`}>
          <LumiOrb size={30} active={chat.sending} />
          <span className="lumi-launcher-label">{config.assistantName}</span>
        </button>
      )}
    </>
  );
}
