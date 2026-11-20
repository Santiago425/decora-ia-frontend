// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../context/authContext';
import type { AdminStats, AdminUser } from '../types/admin';
import type * as MetaService from '../services/metaService';
import Admin from './Admin';

const admin = vi.hoisted(() => ({ stats: vi.fn(), users: vi.fn(), updateUser: vi.fn(), report: vi.fn() }));
vi.mock('../services/adminService', () => ({ adminService: admin }));
vi.mock('../services/metaService', async (original) => ({
  ...(await original<typeof MetaService>()),
  metaService: {
    publicMeta: vi
      .fn()
      .mockResolvedValue({ demo_accounts: [], available_providers: [{ key: 'huggingface', label: 'FLUX Kontext' }] }),
  },
}));
vi.mock('../components/patterns/PatternBadge', () => ({ PatternBadge: () => null }));
// Charts and animated counters are visual; the numbers they receive are what matters here.
vi.mock('../components/admin/ActivityChart', () => ({ ActivityChart: () => null }));
vi.mock('../components/dashboard/StatCard', () => ({
  StatCard: ({ label, value }: { label: string; value: number }) => (
    <p>
      {label}: {value}
    </p>
  ),
}));
vi.mock('../components/admin/CatalogAdmin', () => ({ CatalogAdmin: () => <p>Catálogo del administrador</p> }));

const STATS: AdminStats = {
  totals: { users: 12, projects: 30, redesigns: 45, assistant_messages: 80 },
  active_users: 10,
  new_users: 3,
  users_by_role: { admin: 2, user: 10 },
  projects_by_status: { draft: 5, in_design: 15, finished: 10 },
  redesigns_by_status: {},
  top_styles: [{ slug: 'nordic', name: 'Nórdico', count: 9 }],
  daily: [],
  providers: { text: 'gemini', image: 'huggingface', image_fallback: 'none', storage: 'database' },
  days: 30,
} as AdminStats;

const user = (id: string, full_name: string, overrides: Partial<AdminUser> = {}): AdminUser => ({
  id,
  full_name,
  email: `${id}@correo.com`,
  role: 'user',
  is_active: true,
  last_login_at: null,
  created_at: '2026-11-01T10:00:00Z',
  project_count: 1,
  ...overrides,
});

const ME = user('admin', 'Administrador Habita', { role: 'admin' });
const LAURA = user('laura', 'Laura Gómez');

function renderAdmin(path = '/admin') {
  const auth: AuthContextValue = {
    user: { id: ME.id, full_name: ME.full_name, email: ME.email, role: 'admin', created_at: ME.created_at },
    ready: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('Admin page', () => {
  beforeEach(() => {
    Object.values(admin).forEach((fn) => fn.mockReset());
    admin.stats.mockResolvedValue(STATS);
    admin.users.mockResolvedValue({ items: [ME, LAURA], total: 2, page: 1, page_size: 10 });
  });

  it('shows the platform totals on the summary tab', async () => {
    renderAdmin();
    expect(await screen.findByText('Usuarios: 12')).toBeTruthy();
    expect(screen.getByText('Rediseños: 45')).toBeTruthy();
    expect(screen.getByText('Nórdico')).toBeTruthy();
    expect(await screen.findByText('FLUX Kontext')).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Resumen/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('lets the admin retry when the stats fail', async () => {
    admin.stats.mockRejectedValueOnce(new Error('No tienes permiso'));
    renderAdmin();
    expect((await screen.findByRole('alert')).textContent).toContain('No tienes permiso');
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByText('Usuarios: 12')).toBeTruthy();
  });

  it('changes the role of another user but not the own one', async () => {
    admin.updateUser.mockResolvedValue({ ...LAURA, role: 'admin' });
    renderAdmin('/admin?tab=users');

    const own = await screen.findByLabelText('Rol de Administrador Habita');
    expect(own.hasAttribute('disabled')).toBe(true);
    expect(screen.getByLabelText('Desactivar a Administrador Habita').hasAttribute('disabled')).toBe(true);

    await userEvent.selectOptions(screen.getByLabelText('Rol de Laura Gómez'), 'admin');
    expect(admin.updateUser).toHaveBeenCalledWith('laura', { role: 'admin' });
    await vi.waitFor(() =>
      expect((screen.getByLabelText('Rol de Laura Gómez') as HTMLSelectElement).value).toBe('admin'),
    );
  });

  it('deactivates a user account', async () => {
    admin.updateUser.mockResolvedValue({ ...LAURA, is_active: false });
    renderAdmin('/admin?tab=users');
    await userEvent.click(await screen.findByLabelText('Desactivar a Laura Gómez'));
    expect(admin.updateUser).toHaveBeenCalledWith('laura', { is_active: false });
    expect(await screen.findByLabelText('Activar a Laura Gómez')).toBeTruthy();
  });

  it('searches users with the typed text', async () => {
    renderAdmin('/admin?tab=users');
    await screen.findByText('Laura Gómez');
    await userEvent.type(screen.getByLabelText('Buscar usuarios'), 'laura');
    await vi.waitFor(() =>
      expect(admin.users).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'laura', page: 1 })),
    );
  });

  it('moves between sections with the tabs', async () => {
    renderAdmin();
    await screen.findByText('Usuarios: 12');
    await userEvent.click(screen.getByRole('tab', { name: /Catálogo/ }));
    expect(screen.getByText('Catálogo del administrador')).toBeTruthy();
    await userEvent.click(screen.getByRole('tab', { name: /Reportes/ }));
    expect(screen.getByRole('button', { name: 'Descargar usuarios en CSV' })).toBeTruthy();
  });

  it('downloads a report in the chosen format', async () => {
    admin.report.mockResolvedValue({ blob: new Blob(['a,b']), fileName: 'usuarios.csv' });
    URL.createObjectURL = vi.fn(() => 'blob:reporte');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderAdmin('/admin?tab=reports');
    await userEvent.click(screen.getByRole('button', { name: 'Descargar proyectos en JSON' }));
    expect(admin.report).toHaveBeenCalledWith('proyectos', 'json');
    await vi.waitFor(() => expect(click).toHaveBeenCalled());
    click.mockRestore();
  });
});
