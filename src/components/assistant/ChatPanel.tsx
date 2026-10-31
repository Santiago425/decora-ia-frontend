import { Mic, Send, Square, Trash2, Volume2, VolumeX } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { chatStore, useChat } from '../../assistant/chatStore';
import { pageContextFor } from '../../assistant/pageContext';
import { VoiceAdapter } from '../../assistant/voiceAdapter';
import { config } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { notificationCenter } from '../../services/notificationCenter';
import type { AssistantAction, ChatMessage } from '../../types/assistant';
import { LumiOrb } from './LumiOrb';

const SUGGESTIONS: Record<string, string[]> = {
  editor: ['Agrega una planta', 'Pinta las paredes verde salvia', 'Aplica el estilo japandi', 'Más luz, por favor', 'Deshaz el último cambio'],
  default: ['Crea una sala nórdica', '¿Qué estilo me recomiendas para un dormitorio?', 'Quiero rediseñar una foto de mi cocina', '¿Cuánto llevo de presupuesto?'],
};

const ACTION_LABELS: Record<AssistantAction['type'], string> = {
  navigate: 'Te llevé a otra sección',
  open_project: 'Abrió el proyecto',
  start_redesign: 'Preparó el rediseño',
  add_furniture: 'Agregó un mueble',
  change_style: 'Cambió el estilo',
  change_wall: 'Cambió las paredes',
  change_floor: 'Cambió el piso',
  set_lighting: 'Ajustó la luz',
  undo: 'Deshizo un cambio',
  redo: 'Rehizo un cambio',
  rotate_selected: 'Giró el mueble',
  remove_selected: 'Quitó el mueble',
  duplicate_selected: 'Duplicó el mueble',
};

function richText(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : <Fragment key={index}>{part}</Fragment>,
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  return (
    <li className={`bubble-row ${message.sender}`}>
      {message.sender === 'assistant' && <LumiOrb size={28} />}
      <div className={`bubble ${message.sender} ${message.id < 0 ? 'pending' : ''}`}>
        <p>{richText(message.content)}</p>
        {message.actions.length > 0 && (
          <div className="bubble-actions">
            {message.actions.map((action, index) => (
              <span key={index}>✓ {action.type === 'add_furniture' && action.params.name ? `Agregó ${action.params.name}` : ACTION_LABELS[action.type]}</span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export function ChatPanel({ compact = false, onClose }: { compact?: boolean; onClose?: () => void }) {
  const { user } = useAuth();
  const chat = useChat();
  const location = useLocation();
  const context = pageContextFor(location.pathname);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const voice = useMemo(() => new VoiceAdapter(config.locale), []);
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const suggestions = SUGGESTIONS[context.page] ?? SUGGESTIONS.default;

  useEffect(() => {
    if (user) chatStore.load(user.id);
  }, [user]);

  useEffect(() => {
    chatStore.onReply = (reply) => {
      if (chatStore.getState().voiceReplies) voice.speak(reply.content);
    };
    return () => {
      voice.stopListening();
      voice.stopSpeaking();
    };
  }, [voice]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [chat.messages.length, chat.sending]);

  useEffect(() => {
    if (chat.error) notificationCenter.notify(chat.error, 'error');
  }, [chat.error]);

  function send(text: string) {
    if (!text.trim()) return;
    setDraft('');
    chatStore.send(text, context);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(draft);
  }

  function toggleMic() {
    if (listening) {
      voice.stopListening();
      return;
    }
    voice.stopSpeaking();
    setListening(true);
    voice.listen(
      ({ transcript, final }) => {
        setDraft(transcript);
        if (final) send(transcript);
      },
      (message) => notificationCenter.notify(message, 'error'),
      () => setListening(false),
    );
  }

  const firstName = user?.full_name.split(' ')[0] ?? '';

  return (
    <section className={`chat-panel ${compact ? 'compact' : ''}`} aria-label={`Chat con ${config.assistantName}`}>
      <header className="chat-head">
        <LumiOrb size={compact ? 34 : 42} active={chat.sending || listening} />
        <div>
          <h2>{config.assistantName}</h2>
          <small>{listening ? 'Te escucho…' : chat.sending ? 'Pensando…' : 'Tu asistente de diseño'}</small>
        </div>
        <div className="chat-head-actions">
          {voice.canSpeak && (
            <button
              className="icon-button"
              onClick={() => chatStore.setVoiceReplies(!chat.voiceReplies)}
              aria-pressed={chat.voiceReplies}
              title={chat.voiceReplies ? 'Silenciar respuestas' : 'Leer respuestas en voz alta'}
              aria-label={chat.voiceReplies ? 'Silenciar respuestas' : 'Leer respuestas en voz alta'}
            >
              {chat.voiceReplies ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
          )}
          {chat.messages.length > 0 && (
            <button className="icon-button" onClick={() => chatStore.clear()} title="Borrar conversación" aria-label="Borrar conversación">
              <Trash2 size={16} />
            </button>
          )}
          {onClose && (
            <button className="icon-button" onClick={onClose} aria-label="Cerrar chat" title="Cerrar">
              ×
            </button>
          )}
        </div>
      </header>

      <ul className="chat-list" ref={list} aria-live="polite">
        {chat.loaded && chat.messages.length === 0 && (
          <li className="chat-intro">
            <LumiOrb size={56} />
            <h3>Hola{firstName && `, ${firstName}`}. Soy {config.assistantName}.</h3>
            <p>
              {context.page === 'editor'
                ? 'Dime qué quieres cambiar en tu habitación y lo hago por ti.'
                : 'Puedo crear proyectos, recomendarte estilos, llevarte a rediseñar una foto y mucho más.'}
            </p>
          </li>
        )}
        {chat.messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {chat.sending && (
          <li className="bubble-row assistant">
            <LumiOrb size={28} active />
            <div className="bubble assistant typing" aria-label="Escribiendo">
              <i />
              <i />
              <i />
            </div>
          </li>
        )}
      </ul>

      {!chat.sending && (
        <div className="chat-suggestions">
          {suggestions.map((text) => (
            <button key={text} className="chip" onClick={() => send(text)}>
              {text}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={submit}>
        <button
          type="button"
          className={`mic-button ${listening ? 'listening' : ''}`}
          onClick={toggleMic}
          aria-label={listening ? 'Dejar de escuchar' : 'Hablar con Lumi'}
          title={voice.canListen ? 'Hablar' : 'Dictado no disponible en este navegador'}
        >
          {listening ? <Square size={16} /> : <Mic size={18} />}
        </button>
        <input
          ref={input}
          value={draft}
          maxLength={500}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={listening ? 'Te escucho…' : `Escríbele a ${config.assistantName}`}
          aria-label={`Mensaje para ${config.assistantName}`}
        />
        <button className="send-button" disabled={!draft.trim() || chat.sending} aria-label="Enviar">
          <Send size={17} />
        </button>
      </form>
    </section>
  );
}
