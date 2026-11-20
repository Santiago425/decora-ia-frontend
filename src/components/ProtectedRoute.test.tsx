// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../context/authContext';
import type { User, UserRole } from '../types/auth';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';

function user(role: UserRole): User {
  return { id: '1', full_name: 'Ana Pérez', email: 'ana@correo.com', role, created_at: '2026-01-01T00:00:00Z' };
}

function renderAt(path: string, auth: Partial<AuthContextValue>) {
  const value: AuthContextValue = {
    user: null,
    ready: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...auth,
  };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<p>Página de ingreso</p>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>Página de inicio</p>} />
            <Route path="/projects" element={<p>Mis proyectos</p>} />
          </Route>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<p>Panel de administración</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows the loading screen until the session is restored', () => {
    renderAt('/projects', { ready: false });
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeTruthy();
  });

  it('sends visitors without a session to the login', () => {
    renderAt('/projects', { user: null });
    expect(screen.getByText('Página de ingreso')).toBeTruthy();
  });

  it('opens the page for a signed in user', () => {
    renderAt('/projects', { user: user('user') });
    expect(screen.getByText('Mis proyectos')).toBeTruthy();
  });

  it('keeps regular users out of the admin panel', () => {
    renderAt('/admin', { user: user('user') });
    expect(screen.getByText('Página de inicio')).toBeTruthy();
  });

  it('lets admins into the admin panel', () => {
    renderAt('/admin', { user: user('admin') });
    expect(screen.getByText('Panel de administración')).toBeTruthy();
  });
});

describe('GuestRoute', () => {
  it('sends a signed in user away from the login', () => {
    renderAt('/login', { user: user('user') });
    expect(screen.getByText('Página de inicio')).toBeTruthy();
  });
});
