import type { AssistantPageContext } from '../types/assistant';

export const PAGE_PATHS: Record<string, string> = {
  dashboard: '/',
  redesign: '/redesign',
  editor: '/editor',
  projects: '/projects',
  assistant: '/assistant',
  docs: '/docs',
  admin: '/admin',
};

export function pageContextFor(pathname: string): AssistantPageContext {
  const [, section = '', id] = pathname.split('/');
  const page = Object.keys(PAGE_PATHS).find((key) => PAGE_PATHS[key] === `/${section}`) ?? 'dashboard';
  return page === 'editor' && id ? { page, project_id: id } : { page };
}
