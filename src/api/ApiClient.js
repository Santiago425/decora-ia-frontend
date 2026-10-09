const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const TIMEOUT_MS = 60000;

// Singleton: un único cliente HTTP compartido por toda la app.
class ApiClient {
  static #instance = null;

  static getInstance() {
    if (!ApiClient.#instance) ApiClient.#instance = new ApiClient(BASE_URL);
    return ApiClient.#instance;
  }

  constructor(baseUrl) {
    this.baseUrl = `${baseUrl}/api/v1`;
  }

  async request(path, options = {}) {
    let res;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        ...options,
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor. Si estuvo inactivo puede tardar unos segundos en despertar.');
    }
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('Hiciste muchas solicitudes seguidas. Espera un minuto e inténtalo de nuevo.');
    if (!res.ok) throw new Error(body.error || (body.database && `Base de datos: ${body.database}`) || `Error ${res.status}`);
    return body;
  }

  hello() {
    return this.request('/hello');
  }

  health() {
    return this.request('/health');
  }

  styles() {
    return this.request('/styles');
  }

  roomTypes() {
    return this.request('/room-types');
  }

  previewRemodel(payload) {
    return this.request('/remodels/preview', { method: 'POST', body: JSON.stringify(payload) });
  }
}

export const api = ApiClient.getInstance();
