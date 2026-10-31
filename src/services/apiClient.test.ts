import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiClient, ApiError, apiClient } from './apiClient';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  apiClient.setToken(null);
  apiClient.onUnauthorized(() => {});
});

afterEach(() => vi.unstubAllGlobals());

describe('ApiClient', () => {
  test('is a singleton', () => {
    expect(ApiClient.getInstance()).toBe(apiClient);
  });

  test('sends JSON body and bearer token', async () => {
    apiClient.setToken('abc');
    fetchMock.mockResolvedValueOnce(json({ ok: true }));
    await apiClient.post('/auth/login', { email: 'a@b.co' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${apiClient.baseUrl}/auth/login`);
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ email: 'a@b.co' }));
    expect(init.headers.Authorization).toBe('Bearer abc');
  });

  test('uses the backend detail as error message', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'Correo o contraseña incorrectos' }, 401));
    await expect(apiClient.post('/auth/login', {})).rejects.toThrow('Correo o contraseña incorrectos');
  });

  test('calls the unauthorized handler when a session expires', async () => {
    const handler = vi.fn();
    apiClient.onUnauthorized(handler);
    apiClient.setToken('expired');
    fetchMock.mockResolvedValueOnce(json({ detail: 'Tu sesión expiró' }, 401));
    await expect(apiClient.get('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledOnce();
  });

  test('explains network failures', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(apiClient.get('/hello')).rejects.toMatchObject({ status: 0 });
  });
});
