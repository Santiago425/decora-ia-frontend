import type { ProviderInfo, Role } from './admin';

export interface DemoAccount {
  role: Role;
  name: string;
  email: string;
  password: string;
}

export type ProviderCapability = 'text' | 'image' | 'storage';

export interface ProviderOption {
  key: string;
  label: string;
  capabilities: ProviderCapability[];
  active_for: ProviderCapability[];
}

export interface PublicMeta {
  app_name: string;
  assistant_name: string;
  environment: string;
  currency_code: string;
  providers: ProviderInfo;
  available_providers: ProviderOption[];
  demo_accounts: DemoAccount[];
}

export interface AppInfo extends PublicMeta {
  api_prefix: string;
}
