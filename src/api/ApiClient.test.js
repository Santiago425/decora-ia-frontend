import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './ApiClient.js';

// Crea una respuesta HTTP falsa con cuerpo JSON
function respuesta(cuerpo, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  // La instancia es compartida: se reinicia su estado antes de cada prueba
  api.setToken(null);
  api.onUnauthorized(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('ApiClient', () => {
  describe('Singleton y URL base', () => {
    test('getInstance devuelve siempre la misma instancia', async () => {
      vi.resetModules();
      const primero = await import('./ApiClient.js');
      const segundo = await import('./ApiClient.js');
      expect(primero.api).toBe(segundo.api);
    });

    test('usa VITE_API_URL, le quita la barra final y agrega /api/v1', async () => {
      vi.stubEnv('VITE_API_URL', 'https://api.ejemplo.com/');
      vi.resetModules();
      const { api: cliente } = await import('./ApiClient.js');
      expect(cliente.baseUrl).toBe('https://api.ejemplo.com/api/v1');
    });

    test('usa http://localhost:3000 cuando VITE_API_URL está vacía', async () => {
      vi.stubEnv('VITE_API_URL', '');
      vi.resetModules();
      const { api: cliente } = await import('./ApiClient.js');
      expect(cliente.baseUrl).toBe('http://localhost:3000/api/v1');
    });
  });

  describe('cabeceras y opciones de la petición', () => {
    test('sin token envía Content-Type y no envía Authorization', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({ ok: true }));
      await api.hello();
      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(init.headers).not.toHaveProperty('Authorization');
    });

    test('con token envía Authorization: Bearer', async () => {
      api.setToken('abc123');
      fetchMock.mockResolvedValueOnce(respuesta({ ok: true }));
      await api.hello();
      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers.Authorization).toBe('Bearer abc123');
    });

    test('al quitar el token deja de enviar Authorization', async () => {
      api.setToken('abc123');
      api.setToken(null);
      fetchMock.mockResolvedValueOnce(respuesta({ ok: true }));
      await api.hello();
      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).not.toHaveProperty('Authorization');
    });

    test('usa credentials omit y una señal de timeout', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({ ok: true }));
      await api.hello();
      const [, init] = fetchMock.mock.calls[0];
      expect(init.credentials).toBe('omit');
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('endpoints GET', () => {
    test.each([
      ['hello', '/hello'],
      ['health', '/health'],
      ['styles', '/styles'],
      ['roomTypes', '/room-types'],
      ['me', '/auth/me'],
    ])('api.%s() consulta %s', async (metodo, ruta) => {
      fetchMock.mockResolvedValueOnce(respuesta({ ok: true }));
      await api[metodo]();
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${api.baseUrl}${ruta}`);
      expect(init.body).toBeUndefined();
    });
  });

  describe('endpoints POST', () => {
    test.each([
      ['register', '/auth/register', { nombre: 'Ana', email: 'ana@correo.com', password: 'secreta123' }],
      ['login', '/auth/login', { email: 'ana@correo.com', password: 'secreta123' }],
      ['previewRemodel', '/remodels/preview', { estilo: 'moderno', habitacion: 'sala' }],
    ])('api.%s() envía POST a %s con el cuerpo en JSON', async (metodo, ruta, payload) => {
      fetchMock.mockResolvedValueOnce(respuesta({ ok: true }));
      await api[metodo](payload);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${api.baseUrl}${ruta}`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });
  });

  describe('manejo de respuestas y errores', () => {
    test('devuelve el cuerpo JSON cuando la respuesta es exitosa', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({ estilos: ['moderno', 'rustico'] }));
      await expect(api.styles()).resolves.toEqual({ estilos: ['moderno', 'rustico'] });
    });

    test('devuelve {} si la respuesta exitosa no trae JSON válido', async () => {
      fetchMock.mockResolvedValueOnce(new Response('no es json', { status: 200 }));
      await expect(api.hello()).resolves.toEqual({});
    });

    test('lanza un mensaje de conexión cuando fetch falla', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.hello()).rejects.toThrow('No se pudo conectar con el servidor');
    });

    test('con 401 y token llama al manejador onUnauthorized y lanza el error', async () => {
      const manejador = vi.fn();
      api.onUnauthorized(manejador);
      api.setToken('abc123');
      fetchMock.mockResolvedValueOnce(respuesta({ error: 'Token inválido' }, 401));
      await expect(api.me()).rejects.toThrow('Token inválido');
      expect(manejador).toHaveBeenCalledTimes(1);
    });

    test('con 401 y sin token no llama al manejador onUnauthorized', async () => {
      const manejador = vi.fn();
      api.onUnauthorized(manejador);
      fetchMock.mockResolvedValueOnce(respuesta({}, 401));
      await expect(api.me()).rejects.toThrow('Error 401');
      expect(manejador).not.toHaveBeenCalled();
    });

    test('con 429 sin mensaje del servidor lanza el aviso de demasiadas solicitudes', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({}, 429));
      await expect(api.hello()).rejects.toThrow('Hiciste muchas solicitudes seguidas');
    });

    test('con 429 y mensaje del servidor usa el mensaje del servidor', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({ error: 'Límite diario alcanzado' }, 429));
      await expect(api.hello()).rejects.toThrow('Límite diario alcanzado');
    });

    test('usa body.error como mensaje cuando la respuesta falla', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({ error: 'Credenciales incorrectas' }, 400));
      await expect(api.login({})).rejects.toThrow('Credenciales incorrectas');
    });

    test('usa body.database como mensaje cuando no hay body.error', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({ database: 'desconectada' }, 503));
      await expect(api.health()).rejects.toThrow('Base de datos: desconectada');
    });

    test('usa "Error <status>" cuando el cuerpo no trae mensaje', async () => {
      fetchMock.mockResolvedValueOnce(respuesta({}, 500));
      await expect(api.hello()).rejects.toThrow('Error 500');
    });

    test('usa "Error <status>" cuando el cuerpo de error no es JSON', async () => {
      fetchMock.mockResolvedValueOnce(new Response('<html>caído</html>', { status: 500 }));
      await expect(api.hello()).rejects.toThrow('Error 500');
    });
  });
});
