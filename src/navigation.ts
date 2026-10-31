import { BookOpen, Box, FolderHeart, LayoutDashboard, ShieldCheck, Sparkles, WandSparkles, type LucideIcon } from 'lucide-react';
import { config } from './config';
import type { UserRole } from './types/auth';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  role?: UserRole;
  inMobileBar?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, inMobileBar: true },
  { to: '/redesign', label: 'Rediseño', icon: WandSparkles, inMobileBar: true },
  { to: '/assistant', label: config.assistantName, icon: Sparkles, inMobileBar: true },
  { to: '/editor', label: 'Editor 3D', icon: Box, inMobileBar: true },
  { to: '/projects', label: 'Mis proyectos', icon: FolderHeart },
  { to: '/docs', label: 'Documentación', icon: BookOpen },
  { to: '/admin', label: 'Administración', icon: ShieldCheck, role: 'admin' },
];

export function navFor(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.role || item.role === role);
}
