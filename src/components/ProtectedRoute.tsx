import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ role }: { role?: UserRole }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <LoadingScreen />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
