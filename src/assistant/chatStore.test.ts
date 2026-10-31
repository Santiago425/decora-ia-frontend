import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from '../types/assistant';

const message = (id: number, sender: 'user' | 'assistant', content: string, actions: ChatMessage['actions'] = []): ChatMessage => ({
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

describe('chatStore', () => {
  beforeEach(() => {
    chatStore.reset();
    send.mockReset();
  });

  it('saves the reply and publishes its actions to whoever can run them', async () => {
    const action = { type: 'add_furniture' as const, params: { furniture_id: 3 } };
    send.mockResolvedValue({ message: message(1, 'user', 'agrega una planta'), reply: message(2, 'assistant', 'Listo', [action]), provider: 'rules' });
    const handler = vi.fn(() => true);
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
});
