import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { navFor } from '../../navigation';
import { Logo } from '../Logo';
import { Avatar } from './UserBadge';

export function MobileTopBar() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <header className="mobile-topbar">
      <Logo size={32} withName />
      <Avatar user={user} size={34} />
    </header>
  );
}

export function MobileNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  if (!user) return null;
  const items = navFor(user.role);
  const barItems = items.filter((item) => item.inMobileBar);
  const moreItems = items.filter((item) => !item.inMobileBar);

  return (
    <>
      {open && <div className="sheet-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className={`more-sheet ${open ? 'open' : ''}`} role="dialog" aria-label="Más opciones" aria-hidden={!open}>
        {moreItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="sheet-link" tabIndex={open ? 0 : -1}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button className="sheet-link" onClick={logout} tabIndex={open ? 0 : -1}>
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
      <nav className="mobile-nav" aria-label="Principal">
        {barItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="mobile-link">
            <Icon size={21} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button className={`mobile-link ${open ? 'active' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? <X size={21} /> : <Menu size={21} />}
          <span>Más</span>
        </button>
      </nav>
    </>
  );
}
