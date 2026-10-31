import type { AssistantAction } from '../types/assistant';

type Handler = (action: AssistantAction) => boolean;

// Observer: Lumi publishes actions and whichever screen can perform them (router, 3D editor) subscribes.
class AssistantBus {
  #handlers = new Set<Handler>();

  subscribe(handler: Handler): () => void {
    this.#handlers.add(handler);
    return () => {
      this.#handlers.delete(handler);
    };
  }

  publish(action: AssistantAction): boolean {
    let handled = false;
    this.#handlers.forEach((handler) => {
      handled = handler(action) || handled;
    });
    return handled;
  }
}

export const assistantBus = new AssistantBus();
