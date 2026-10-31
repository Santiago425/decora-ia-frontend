import type { Session } from '../types/auth';

const KEY = 'session';

interface StoredSession {
  session: Session;
  expiresAt: number;
}

export const sessionStore = {
  load(): Session | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      const stored = JSON.parse(raw) as StoredSession;
      if (Date.now() >= stored.expiresAt) {
        sessionStorage.removeItem(KEY);
        return null;
      }
      return stored.session;
    } catch {
      return null;
    }
  },
  save(session: Session): void {
    const stored: StoredSession = { session, expiresAt: Date.now() + session.expires_in * 1000 };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(stored));
    } catch {
      /* storage unavailable: the session lives only in memory */
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  },
};
