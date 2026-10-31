import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { navFor } from '../../navigation';
import { Logo } from '../Logo';
import { Avatar } from './UserBadge';

export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={38} withName />
      </div>
      <nav className="sidebar-nav" aria-label="Principal">
        {navFor(user.role).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="sidebar-link" title={label}>
            <Icon size={20} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <Avatar user={user} />
        <div className="sidebar-user-text">
          <strong>{user.full_name}</strong>
          <small>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</small>
        </div>
        <button className="icon-button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
