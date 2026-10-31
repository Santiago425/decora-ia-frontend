import type { ProviderInfo, Role } from './admin';

export interface DemoAccount {
  role: Role;
  name: string;
  email: string;
  password: string;
}

export interface AppInfo {
  app_name: string;
  assistant_name: string;
  environment: string;
  api_prefix: string;
  providers: ProviderInfo;
  demo_accounts: DemoAccount[];
}
