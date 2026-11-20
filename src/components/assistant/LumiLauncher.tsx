import { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../assistant/chatStore';
import { config } from '../../config';
import { lazyWithPreload } from '../../utils/lazyWithPreload';
import { PageLoading } from '../PageLoading';
import { LumiOrb } from './LumiOrb';

const ChatPanel = lazyWithPreload(() => import('./ChatPanel').then((m) => ({ default: m.ChatPanel })));
const warmChat = () => void ChatPanel.preload().catch(() => undefined);

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
          <Suspense fallback={<PageLoading />}>
            <ChatPanel compact onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      )}
      {!open && (
        <button
          className={`lumi-launcher ${inEditor ? 'in-editor' : ''}`}
          onClick={() => setOpen(true)}
          onMouseEnter={warmChat}
          onFocus={warmChat}
          onTouchStart={warmChat}
          aria-label={`Hablar con ${config.assistantName}`}
        >
          <LumiOrb size={30} active={chat.sending} />
          <span className="lumi-launcher-label">{config.assistantName}</span>
        </button>
      )}
    </>
  );
}
