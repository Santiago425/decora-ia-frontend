import { createContext } from 'react';
import type { LoginPayload, RegisterPayload, User } from '../types/auth';

export interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
