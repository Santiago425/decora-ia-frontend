import { lazyWithPreload } from '../utils/lazyWithPreload';

export const pages = {
  login: lazyWithPreload(() => import('../pages/Login')),
  register: lazyWithPreload(() => import('../pages/Register')),
  dashboard: lazyWithPreload(() => import('../pages/Dashboard')),
  redesign: lazyWithPreload(() => import('../pages/Redesign')),
  assistant: lazyWithPreload(() => import('../pages/Assistant')),
  editorHome: lazyWithPreload(() => import('../pages/EditorHome')),
  editor: lazyWithPreload(() => import('../pages/Editor')),
  projects: lazyWithPreload(() => import('../pages/Projects')),
  docs: lazyWithPreload(() => import('../pages/Docs')),
  admin: lazyWithPreload(() => import('../pages/Admin')),
  notFound: lazyWithPreload(() => import('../pages/NotFound')),
};

const byPath: Record<string, keyof typeof pages> = {
  '/': 'dashboard',
  '/redesign': 'redesign',
  '/assistant': 'assistant',
  '/editor': 'editorHome',
  '/projects': 'projects',
  '/docs': 'docs',
  '/admin': 'admin',
  '/login': 'login',
  '/register': 'register',
};

/** Starts downloading a page as soon as the person shows intent (hover, focus or touch on its link). */
export function preloadRoute(path: string): void {
  const key = path.startsWith('/editor/') ? 'editor' : byPath[path];
  if (key) void pages[key].preload().catch(() => undefined);
}

export const preloadHandlers = (path: string) => ({
  onMouseEnter: () => preloadRoute(path),
  onFocus: () => preloadRoute(path),
  onTouchStart: () => preloadRoute(path),
});
