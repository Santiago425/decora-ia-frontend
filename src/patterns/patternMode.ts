import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'habita.pattern-mode';

function readSaved(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

// Observer: every badge subscribes to this switch and redraws when it changes, without knowing who flipped it.
class PatternModeStore {
  #enabled = typeof window !== 'undefined' && readSaved();
  #listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  isEnabled = () => this.#enabled;

  set(enabled: boolean) {
    if (enabled === this.#enabled) return;
    this.#enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
      // The switch still works for this visit without storage.
    }
    this.#listeners.forEach((listener) => listener());
  }

  toggle = () => this.set(!this.#enabled);
}

export const patternMode = new PatternModeStore();

export function usePatternMode(): boolean {
  return useSyncExternalStore(patternMode.subscribe, patternMode.isEnabled, () => false);
}
