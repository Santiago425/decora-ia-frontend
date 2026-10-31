import type { AssistantPageContext, AssistantReply, ChatMessage } from '../types/assistant';
import { apiClient } from './apiClient';

export const assistantService = {
  history: () => apiClient.get<ChatMessage[]>('/assistant/messages'),
  send: (message: string, context: AssistantPageContext) =>
    apiClient.post<AssistantReply>('/assistant/messages', { message, ...context }),
  clear: () => apiClient.delete<{ message: string }>('/assistant/messages'),
};
