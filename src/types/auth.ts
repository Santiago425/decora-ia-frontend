export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}
