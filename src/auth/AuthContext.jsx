import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/ApiClient.js';

const STORAGE_KEY = 'decoraia.session';
const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento disponible: la sesión vive solo en memoria.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = readSession();
    api.setToken(saved?.token ?? null);
    return saved;
  });
  const [modal, setModal] = useState(null);

  const apply = useCallback((next) => {
    api.setToken(next?.token ?? null);
    writeSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => apply(null), [apply]);

  useEffect(() => {
    api.onUnauthorized(logout);
    if (session?.token) api.me().then(({ user }) => apply({ ...session, user })).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      login: async (credentials) => apply(await api.login(credentials)),
      register: async (data) => apply(await api.register(data)),
      logout,
      modal,
      openAuth: (mode = 'login') => setModal(mode),
      closeAuth: () => setModal(null),
    }),
    [session, modal, apply, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
