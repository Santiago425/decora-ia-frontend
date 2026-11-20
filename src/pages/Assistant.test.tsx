// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assistantBus } from '../assistant/assistantBus';
import { chatStore } from '../assistant/chatStore';
import { AuthContext, type AuthContextValue } from '../context/authContext';
import type { AssistantAction, ChatMessage } from '../types/assistant';
import Assistant from './Assistant';

const service = vi.hoisted(() => ({ history: vi.fn(), send: vi.fn(), clear: vi.fn() }));
vi.mock('../services/assistantService', () => ({ assistantService: service }));
vi.mock('../components/patterns/PatternBadge', () => ({ PatternBadge: () => null }));
// The glass sphere is WebGL; the chat is what this page is about.
vi.mock('../components/assistant/LumiOrb', () => ({ LumiOrb: () => null }));

let ownerId = 0;

const message = (id: number, sender: ChatMessage['sender'], content: string, actions: AssistantAction[] = []) => ({
  id,
  sender,
  content,
  intent: null,
  actions,
  created_at: '2026-11-20T12:00:00Z',
});

function renderAssistant() {
  ownerId += 1;
  const auth: AuthContextValue = {
    user: { id: `u${ownerId}`, full_name: 'Laura Gómez', email: 'laura@correo.com', role: 'user', created_at: '' },
    ready: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/assistant']}>
        <Routes>
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const input = () => screen.getByLabelText('Mensaje para Lumi');

describe('Lumi assistant page', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.history.mockResolvedValue([]);
  });

  afterEach(() => chatStore.reset());

  it('greets the user by name when there is no conversation yet', async () => {
    renderAssistant();
    expect(await screen.findByText('Hola, Laura. Soy Lumi.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crea una sala nórdica' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar' }).hasAttribute('disabled')).toBe(true);
  });

  it('shows the earlier conversation', async () => {
    service.history.mockResolvedValue([message(1, 'user', 'Hola'), message(2, 'assistant', 'Hola, ¿qué diseñamos?')]);
    renderAssistant();
    expect(await screen.findByText('Hola, ¿qué diseñamos?')).toBeTruthy();
    expect(screen.queryByText('Hola, Laura. Soy Lumi.')).toBeNull();
  });

  it('sends a written message with the page context and shows the reply', async () => {
    service.send.mockResolvedValue({
      message: message(10, 'user', '¿Qué estilo me recomiendas?'),
      reply: message(11, 'assistant', 'Te recomiendo el estilo **Japandi**.'),
      provider: 'gemini',
    });
    renderAssistant();
    await screen.findByText('Hola, Laura. Soy Lumi.');
    await userEvent.type(input(), '¿Qué estilo me recomiendas?{Enter}');

    expect(service.send).toHaveBeenCalledWith(
      '¿Qué estilo me recomiendas?',
      expect.objectContaining({ page: 'assistant' }),
    );
    expect((await screen.findByText('Japandi')).tagName).toBe('STRONG');
    expect((input() as HTMLInputElement).value).toBe('');
  });

  it('sends a suggestion with one tap and runs the action Lumi returns', async () => {
    const navigate: AssistantAction = { type: 'navigate', params: { path: '/editor' } };
    const handler = vi.fn(() => 'done' as const);
    const unsubscribe = assistantBus.subscribe(handler);
    service.send.mockResolvedValue({
      message: message(20, 'user', 'Crea una sala nórdica'),
      reply: message(21, 'assistant', 'Listo, creé tu sala.', [navigate]),
      provider: 'gemini',
    });
    renderAssistant();
    await userEvent.click(await screen.findByRole('button', { name: 'Crea una sala nórdica' }));

    expect(await screen.findByText('Listo, creé tu sala.')).toBeTruthy();
    expect(screen.getByText('✓ Te llevé a otra sección')).toBeTruthy();
    expect(handler).toHaveBeenCalledWith(navigate);
    unsubscribe();
  });

  it('removes the pending message when Lumi cannot answer', async () => {
    service.send.mockRejectedValue(new Error('Lumi no está disponible'));
    renderAssistant();
    await screen.findByText('Hola, Laura. Soy Lumi.');
    await userEvent.type(input(), 'Agrega una planta{Enter}');
    await vi.waitFor(() => expect(screen.queryByText('Agrega una planta')).toBeNull());
    expect(screen.getByText('Hola, Laura. Soy Lumi.')).toBeTruthy();
  });

  it('clears the conversation', async () => {
    service.history.mockResolvedValue([message(1, 'assistant', 'Hola de nuevo')]);
    service.clear.mockResolvedValue({ message: 'ok' });
    renderAssistant();
    await userEvent.click(await screen.findByRole('button', { name: 'Borrar conversación' }));
    expect(service.clear).toHaveBeenCalled();
    expect(await screen.findByText('Hola, Laura. Soy Lumi.')).toBeTruthy();
  });
});
