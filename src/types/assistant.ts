export type AssistantActionType =
  | 'navigate'
  | 'open_project'
  | 'start_redesign'
  | 'add_furniture'
  | 'change_style'
  | 'change_wall'
  | 'change_floor'
  | 'set_lighting'
  | 'undo'
  | 'redo'
  | 'rotate_selected'
  | 'remove_selected'
  | 'duplicate_selected';

export interface AssistantAction {
  type: AssistantActionType;
  params: Record<string, string | number>;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'assistant';
  content: string;
  intent: string | null;
  actions: AssistantAction[];
  created_at: string;
}

export interface AssistantReply {
  message: ChatMessage;
  reply: ChatMessage;
  provider: string;
}

export interface AssistantPageContext {
  page: string;
  project_id?: string;
}
