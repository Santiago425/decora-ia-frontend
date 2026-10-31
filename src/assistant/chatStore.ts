import { useSyncExternalStore } from 'react';
import { assistantService } from '../services/assistantService';
import type { AssistantPageContext, ChatMessage } from '../types/assistant';
import { assistantBus } from './assistantBus';

export interface ChatState {
  messages: ChatMessage[];
  loaded: boolean;
  sending: boolean;
  error: string;
  voiceReplies: boolean;
}

const VOICE_KEY = 'habita.voiceReplies';

function readVoicePreference(): boolean {
  try {
    return localStorage.getItem(VOICE_KEY) === 'true';
  } catch {
    return false;
  }
}

// Observer: the floating chat and the assistant page share this conversation and stay in sync.
class ChatStore {
  #state: ChatState = { messages: [], loaded: false, sending: false, error: '', voiceReplies: readVoicePreference() };
  #listeners = new Set<() => void>();
  #owner: string | null = null;
  #nextLocalId = -1;
  onReply: (message: ChatMessage) => void = () => {};

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  getState = () => this.#state;

  async load(owner: string): Promise<void> {
    if (this.#owner === owner && this.#state.loaded) return;
    this.#owner = owner;
    this.#set({ messages: [], loaded: false, error: '' });
    try {
      const messages = await assistantService.history();
      if (this.#owner === owner) this.#set({ messages, loaded: true });
    } catch (error) {
      this.#set({ loaded: true, error: (error as Error).message });
    }
  }

  async send(text: string, context: AssistantPageContext): Promise<void> {
    const content = text.trim();
    if (!content || this.#state.sending) return;
    const pending: ChatMessage = {
      id: this.#nextLocalId--,
      sender: 'user',
      content,
      intent: null,
      actions: [],
      created_at: new Date().toISOString(),
    };
    this.#set({ messages: [...this.#state.messages, pending], sending: true, error: '' });
    try {
      const { message, reply } = await assistantService.send(content, context);
      this.#set({ messages: [...this.#state.messages.filter((m) => m.id !== pending.id), message, reply], sending: false });
      this.onReply(reply);
      reply.actions.forEach((action) => assistantBus.publish(action));
    } catch (error) {
      this.#set({ messages: this.#state.messages.filter((m) => m.id !== pending.id), sending: false, error: (error as Error).message });
    }
  }

  async clear(): Promise<void> {
    await assistantService.clear();
    this.#set({ messages: [] });
  }

  setVoiceReplies(voiceReplies: boolean): void {
    try {
      localStorage.setItem(VOICE_KEY, String(voiceReplies));
    } catch {
      /* preference only lives for this visit */
    }
    this.#set({ voiceReplies });
  }

  reset(): void {
    this.#owner = null;
    this.#set({ messages: [], loaded: false, error: '' });
  }

  #set(patch: Partial<ChatState>): void {
    this.#state = { ...this.#state, ...patch };
    this.#listeners.forEach((listener) => listener());
  }
}

export const chatStore = new ChatStore();

export function useChat(): ChatState {
  return useSyncExternalStore(chatStore.subscribe, chatStore.getState);
}
