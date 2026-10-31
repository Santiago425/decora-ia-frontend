import { chatStore } from '../assistant/chatStore';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';
import { sessionStore } from '../services/sessionStore';
import type { LoginPayload, RegisterPayload, Session, User } from '../types/auth';

export interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    sessionStore.clear();
    apiClient.setToken(null);
    setUser(null);
    chatStore.reset();
  }, []);

  const start = useCallback((session: Session) => {
    sessionStore.save(session);
    apiClient.setToken(session.access_token);
    setUser(session.user);
    return session.user;
  }, []);

  useEffect(() => {
    apiClient.onUnauthorized(logout);
    const stored = sessionStore.load();
    if (!stored) {
      setReady(true);
      return;
    }
    apiClient.setToken(stored.access_token);
    setUser(stored.user);
    authService
      .me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setReady(true));
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: async (payload) => start(await authService.login(payload)),
      register: async (payload) => start(await authService.register(payload)),
      logout,
    }),
    [user, ready, start, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
