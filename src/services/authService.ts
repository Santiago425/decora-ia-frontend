import type { LoginPayload, RegisterPayload, Session, User } from '../types/auth';
import { apiClient } from './apiClient';

export const authService = {
  login: (payload: LoginPayload) => apiClient.post<Session>('/auth/login', payload),
  register: (payload: RegisterPayload) => apiClient.post<Session>('/auth/register', payload),
  me: () => apiClient.get<User>('/auth/me'),
};
