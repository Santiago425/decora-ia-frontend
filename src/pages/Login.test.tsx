// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../context/authContext';
import type { LoginPayload, User } from '../types/auth';
import Login from './Login';

const publicMeta = vi.hoisted(() => vi.fn());

vi.mock('../services/metaService', () => ({ metaService: { publicMeta } }));
// The photo carousel and the 3D room are covered by their own checks; here only the form matters.
vi.mock('../components/AuthLayout', () => ({
  AuthLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

const ANA: User = { id: '1', full_name: 'Ana Pérez', email: 'ana@correo.com', role: 'user', created_at: '2026-01-01' };

function renderLogin(login: (payload: LoginPayload) => Promise<User>) {
  const auth: AuthContextValue = { user: null, ready: true, login, register: vi.fn(), logout: vi.fn() };
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>Página de inicio</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    publicMeta.mockReset();
    publicMeta.mockResolvedValue({ demo_accounts: [] });
  });

  it('validates the fields before calling the server', async () => {
    const login = vi.fn();
    renderLogin(login);
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Escribe tu correo')).toBeTruthy();
    expect(screen.getByText('Escribe tu contraseña')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('signs in and opens the home page', async () => {
    const login = vi.fn().mockResolvedValue(ANA);
    renderLogin(login);
    await userEvent.type(screen.getByLabelText('Correo'), ' ana@correo.com ');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Secreto123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Página de inicio')).toBeTruthy();
    expect(login).toHaveBeenCalledWith({ email: 'ana@correo.com', password: 'Secreto123', role: 'user' });
  });

  it('shows the server error and lets the user try again', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Correo o contraseña incorrectos'));
    renderLogin(login);
    await userEvent.type(screen.getByLabelText('Correo'), 'ana@correo.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'equivocada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Correo o contraseña incorrectos');
    expect(screen.getByRole('button', { name: 'Entrar' }).hasAttribute('disabled')).toBe(false);
  });

  it('signs in with a demo account in one click', async () => {
    const admin = { role: 'admin' as const, name: 'Luis', email: 'luis@demo.test', password: 'secreto2' };
    publicMeta.mockResolvedValue({ demo_accounts: [admin] });
    const login = vi.fn().mockResolvedValue({ ...ANA, role: 'admin' });
    renderLogin(login);
    await userEvent.click(await screen.findByRole('button', { name: /administrador de prueba/ }));
    expect(login).toHaveBeenCalledWith({ email: admin.email, password: admin.password, role: 'admin' });
    expect(await screen.findByText('Página de inicio')).toBeTruthy();
  });
});
