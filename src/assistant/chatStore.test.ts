import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from '../types/assistant';

const message = (
  id: number,
  sender: 'user' | 'assistant',
  content: string,
  actions: ChatMessage['actions'] = [],
): ChatMessage => ({
  id,
  sender,
  content,
  intent: null,
  actions,
  created_at: '2026-10-31T00:00:00Z',
});

const send = vi.fn();
vi.mock('../services/assistantService', () => ({
  assistantService: { history: vi.fn(async () => []), send: (...args: unknown[]) => send(...args), clear: vi.fn() },
}));

const { chatStore } = await import('./chatStore');
const { assistantBus } = await import('./assistantBus');
const { notificationCenter } = await import('../services/notificationCenter');

describe('chatStore', () => {
  beforeEach(() => {
    chatStore.reset();
    send.mockReset();
  });

  it('saves the reply and publishes its actions to whoever can run them', async () => {
    const action = { type: 'add_furniture' as const, params: { furniture_id: 3 } };
    send.mockResolvedValue({
      message: message(1, 'user', 'agrega una planta'),
      reply: message(2, 'assistant', 'Listo', [action]),
      provider: 'rules',
    });
    const handler = vi.fn(() => 'done' as const);
    const unsubscribe = assistantBus.subscribe(handler);

    await chatStore.send('agrega una planta', { page: 'editor', project_id: 'p1' });
    unsubscribe();

    expect(send).toHaveBeenCalledWith('agrega una planta', { page: 'editor', project_id: 'p1' });
    expect(chatStore.getState().messages.map((m) => m.content)).toEqual(['agrega una planta', 'Listo']);
    expect(handler).toHaveBeenCalledWith(action);
  });

  it('removes the optimistic message and shows the error when sending fails', async () => {
    send.mockRejectedValue(new Error('Sin conexión'));
    await chatStore.send('hola', { page: 'dashboard' });
    expect(chatStore.getState().messages).toHaveLength(0);
    expect(chatStore.getState().error).toBe('Sin conexión');
    expect(chatStore.getState().sending).toBe(false);
  });

  it('offers to undo the scene changes Lumi made', async () => {
    const actions: ChatMessage['actions'] = [
      { type: 'add_furniture', params: { furniture_id: 3, name: 'Monstera' } },
      { type: 'change_wall', params: { material: 'verde-salvia' } },
      { type: 'navigate', params: { to: 'editor' } },
    ];
    send.mockResolvedValue({
      message: message(1, 'user', 'decora'),
      reply: message(2, 'assistant', 'Listo', actions),
      provider: 'rules',
    });
    const handled = vi.fn(() => 'done' as const);
    const toasts = vi.fn();
    const stopBus = assistantBus.subscribe(handled);
    const stopToasts = notificationCenter.subscribe(toasts);

    await chatStore.send('decora', { page: 'editor', project_id: 'p1' });
    const [toast] = toasts.mock.calls[0];
    expect(toast.message).toContain('Agregó Monstera · Cambió las paredes');
    expect(toast.action.label).toBe('Deshacer');

    handled.mockClear();
    toast.action.run();
    stopBus();
    stopToasts();
    expect(handled).toHaveBeenCalledTimes(2);
    expect(handled).toHaveBeenCalledWith({ type: 'undo', params: {} });
  });

  it('does not offer undo when the editor refused the action', async () => {
    send.mockResolvedValue({
      message: message(1, 'user', 'agrega una planta'),
      reply: message(2, 'assistant', 'Listo', [{ type: 'add_furniture', params: { furniture_id: 3 } }]),
      provider: 'rules',
    });
    const toasts = vi.fn();
    const stopBus = assistantBus.subscribe(() => 'blocked');
    const stopToasts = notificationCenter.subscribe(toasts);
    await chatStore.send('agrega una planta', { page: 'editor', project_id: 'p1' });
    stopBus();
    stopToasts();
    expect(toasts).not.toHaveBeenCalled();
  });

  it('does not offer undo when no screen ran the action', async () => {
    send.mockResolvedValue({
      message: message(1, 'user', 'agrega una planta'),
      reply: message(2, 'assistant', 'Listo', [{ type: 'add_furniture', params: { furniture_id: 3 } }]),
      provider: 'rules',
    });
    const toasts = vi.fn();
    const stopToasts = notificationCenter.subscribe(toasts);
    await chatStore.send('agrega una planta', { page: 'dashboard' });
    stopToasts();
    expect(toasts).not.toHaveBeenCalled();
  });
});
