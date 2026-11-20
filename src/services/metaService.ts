import type { AppInfo, PublicMeta } from '../types/meta';
import { apiClient } from './apiClient';

let publicMetaRequest: Promise<PublicMeta> | null = null;

export const metaService = {
  info: () => apiClient.get<AppInfo>('/meta/info'),
  /** Cached for the whole session: the public metadata only changes on a redeploy. */
  publicMeta: () => {
    publicMetaRequest ??= apiClient.get<PublicMeta>('/meta/public').catch((error: unknown) => {
      publicMetaRequest = null;
      throw error;
    });
    return publicMetaRequest;
  },
};

/** The configured welcome line when the email belongs to a demo account, or an empty string. */
export function demoGreeting(meta: Pick<PublicMeta, 'demo_accounts'> | null, email: string): string {
  const account = meta?.demo_accounts.find((demo) => demo.email.toLowerCase() === email.toLowerCase());
  return account?.greeting ?? '';
}

export function providerLabel(meta: Pick<PublicMeta, 'available_providers'> | null, key: string): string {
  return meta?.available_providers.find((provider) => provider.key === key)?.label ?? key;
}
