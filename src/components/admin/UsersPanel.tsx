import { Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { adminService } from '../../services/adminService';
import { notificationCenter } from '../../services/notificationCenter';
import type { AdminUser, Role, UserFilters } from '../../types/admin';
import { formatRelativeTime } from '../../utils/format';
import { Pager, Panel, SkeletonList } from '../ui';

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const loadUsers = (filters: UserFilters) => adminService.users(filters);
const notifyError = (error: unknown) => notificationCenter.notify((error as Error).message, 'error');

export function UsersPanel() {
  const { user: me } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({ search: '', role: '', active: '', page: 1 });
  const { data, setData, loading } = usePagedQuery(filters, loadUsers, notifyError);
  const [saving, setSaving] = useState<string | null>(null);
  const filter = (patch: Partial<UserFilters>) => setFilters((current) => ({ ...current, page: 1, ...patch }));

  async function change(target: AdminUser, patch: { role?: Role; is_active?: boolean }) {
    setSaving(target.id);
    try {
      const updated = await adminService.updateUser(target.id, patch);
      setData(
        (current) => current && { ...current, items: current.items.map((u) => (u.id === updated.id ? updated : u)) },
      );
      notificationCenter.notify(`Actualizaste a ${updated.full_name}`, 'success');
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <Panel
      className="admin-panel"
      title="Usuarios"
      description={data ? `${data.total} ${data.total === 1 ? 'cuenta' : 'cuentas'}` : 'Cargando…'}
      actions={
        <div className="admin-filters">
          <label className="search-box">
            <Search size={18} />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => filter({ search: e.target.value })}
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar usuarios"
            />
          </label>
          <select
            className="admin-select"
            value={filters.role}
            onChange={(e) => filter({ role: e.target.value as UserFilters['role'] })}
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            <option value="user">Usuarios</option>
            <option value="admin">Administradores</option>
          </select>
          <select
            className="admin-select"
            value={filters.active}
            onChange={(e) => filter({ active: e.target.value as UserFilters['active'] })}
            aria-label="Filtrar por estado"
          >
            <option value="">Activos e inactivos</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>
        </div>
      }
    >
      <div className={`table-wrap ${loading && data ? 'is-refreshing' : ''}`}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Proyectos</th>
              <th>Último ingreso</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user) => {
              const isMe = user.id === me?.id;
              return (
                <tr key={user.id} className={user.is_active ? '' : 'inactive'}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar-sm">{initials(user.full_name)}</span>
                      <div>
                        <strong>
                          {user.full_name} {isMe && <em>(tú)</em>}
                        </strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Rol">
                    <select
                      className="admin-select"
                      value={user.role}
                      disabled={isMe || saving === user.id}
                      onChange={(e) => change(user, { role: e.target.value as Role })}
                      aria-label={`Rol de ${user.full_name}`}
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td data-label="Proyectos">{user.project_count}</td>
                  <td data-label="Último ingreso">
                    {user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Nunca'}
                  </td>
                  <td data-label="Activo">
                    <label className="toggle" title={isMe ? 'No puedes desactivar tu propia cuenta' : undefined}>
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        disabled={isMe || saving === user.id}
                        onChange={(e) => change(user, { is_active: e.target.checked })}
                        aria-label={`${user.is_active ? 'Desactivar' : 'Activar'} a ${user.full_name}`}
                      />
                      <span />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!data && <SkeletonList count={4} className="table-row-skeleton" />}
        {data && data.items.length === 0 && (
          <p className="panel-empty table-empty">No hay usuarios con esos filtros.</p>
        )}
      </div>

      {data && (
        <Pager
          page={filters.page}
          total={data.total}
          pageSize={data.page_size}
          onChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      )}
    </Panel>
  );
}
