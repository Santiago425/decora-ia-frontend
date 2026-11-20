import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicMeta } from '../types/meta';

const get = vi.fn();
vi.mock('./apiClient', () => ({ apiClient: { get: (...args: unknown[]) => get(...args) } }));

const META: PublicMeta = {
  app_name: 'Habita',
  assistant_name: 'Lumi',
  environment: 'test',
  currency_code: 'COP',
  providers: { text: 'mock', image: 'cloudflare', image_fallback: 'mock', storage: 'database' },
  available_providers: [
    { key: 'cloudflare', label: 'Cloudflare Workers AI', capabilities: ['image'], active_for: ['image'] },
    { key: 'mock', label: 'Modo demo', capabilities: ['text', 'image'], active_for: ['text'] },
  ],
  demo_accounts: [],
};

describe('metaService', () => {
  beforeEach(() => {
    vi.resetModules();
    get.mockReset();
  });

  it('requests the public metadata only once per session', async () => {
    get.mockResolvedValue(META);
    const { metaService } = await import('./metaService');
    const [first, second] = await Promise.all([metaService.publicMeta(), metaService.publicMeta()]);
    expect(first).toBe(second);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/meta/public');
  });

  it('retries after a failed request', async () => {
    get.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(META);
    const { metaService } = await import('./metaService');
    await expect(metaService.publicMeta()).rejects.toThrow('offline');
    await expect(metaService.publicMeta()).resolves.toEqual(META);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('labels providers with the names sent by the backend', async () => {
    const { providerLabel } = await import('./metaService');
    expect(providerLabel(META, 'cloudflare')).toBe('Cloudflare Workers AI');
    expect(providerLabel(META, 'unknown')).toBe('unknown');
    expect(providerLabel(null, 'mock')).toBe('mock');
  });
});

describe('demoGreeting', () => {
  const account = { role: 'user' as const, name: 'Profesor', email: 'demo@habita.app', password: 'x' };

  it('returns the welcome line of the matching demo account', async () => {
    const { demoGreeting } = await import('./metaService');
    const meta = { demo_accounts: [{ ...account, greeting: 'Bienvenido' }] };
    expect(demoGreeting(meta, 'Demo@Habita.app')).toBe('Bienvenido');
  });

  it('returns nothing for other people or without metadata', async () => {
    const { demoGreeting } = await import('./metaService');
    expect(demoGreeting({ demo_accounts: [{ ...account, greeting: 'Bienvenido' }] }, 'otra@habita.app')).toBe('');
    expect(demoGreeting({ demo_accounts: [account] }, 'demo@habita.app')).toBe('');
    expect(demoGreeting(null, 'demo@habita.app')).toBe('');
  });
});
