import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import { notificationCenter } from '../../services/notificationCenter';
import type { AdminUser, AdminUserPage, Role } from '../../types/admin';
import { formatRelativeTime } from '../../utils/format';

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export function UsersPanel() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUserPage | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async (text: string, pageNumber: number) => {
    try {
      setData(await adminService.users(text, pageNumber));
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search, page), 250);
    return () => clearTimeout(timer);
  }, [search, page, load]);

  async function change(target: AdminUser, patch: { role?: Role; is_active?: boolean }) {
    setSaving(target.id);
    try {
      const updated = await adminService.updateUser(target.id, patch);
      setData((current) => current && { ...current, items: current.items.map((u) => (u.id === updated.id ? updated : u)) });
      notificationCenter.notify(`Actualizaste a ${updated.full_name}`, 'success');
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    } finally {
      setSaving(null);
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <section className="panel admin-panel">
      <header className="admin-panel-head">
        <div>
          <h2>Usuarios</h2>
          <p>{data ? `${data.total} ${data.total === 1 ? 'cuenta' : 'cuentas'}` : 'Cargando…'}</p>
        </div>
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuarios"
          />
        </label>
      </header>

      <div className="table-wrap">
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
                  <td data-label="Último ingreso">{user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Nunca'}</td>
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
        {data && data.items.length === 0 && <p className="panel-empty table-empty">No hay usuarios con ese nombre o correo.</p>}
      </div>

      {pages > 1 && (
        <nav className="pager" aria-label="Páginas">
          <button className="icon-button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Página anterior">
            <ChevronLeft size={18} />
          </button>
          <span>
            Página {page} de {pages}
          </span>
          <button className="icon-button" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Página siguiente">
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </section>
  );
}
