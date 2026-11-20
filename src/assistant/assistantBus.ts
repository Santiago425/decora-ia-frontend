import type { AssistantAction } from '../types/assistant';

/** done: the action ran. blocked: a screen owns it but refused (for example, a finished project). */
export type ActionOutcome = 'done' | 'blocked' | 'ignored';

type Handler = (action: AssistantAction) => ActionOutcome;

const RANK: Record<ActionOutcome, number> = { ignored: 0, blocked: 1, done: 2 };

// Observer: Lumi publishes actions and whichever screen can perform them (router, 3D editor) subscribes.
class AssistantBus {
  #handlers = new Set<Handler>();

  subscribe(handler: Handler): () => void {
    this.#handlers.add(handler);
    return () => {
      this.#handlers.delete(handler);
    };
  }

  publish(action: AssistantAction): ActionOutcome {
    let outcome: ActionOutcome = 'ignored';
    this.#handlers.forEach((handler) => {
      const result = handler(action);
      if (RANK[result] > RANK[outcome]) outcome = result;
    });
    return outcome;
  }
}

export const assistantBus = new AssistantBus();
