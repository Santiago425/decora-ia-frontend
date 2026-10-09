const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const TIMEOUT_MS = 60000;

// Singleton: un único cliente HTTP compartido por toda la app.
class ApiClient {
  static #instance = null;

  static getInstance() {
    if (!ApiClient.#instance) ApiClient.#instance = new ApiClient(BASE_URL);
    return ApiClient.#instance;
  }

  #token = null;
  #onUnauthorized = () => {};

  constructor(baseUrl) {
    this.baseUrl = `${baseUrl}/api/v1`;
  }

  setToken(token) {
    this.#token = token;
  }

  onUnauthorized(handler) {
    this.#onUnauthorized = handler;
  }

  async request(path, options = {}) {
    let res;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.#token && { Authorization: `Bearer ${this.#token}` }),
        },
        credentials: 'omit',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        ...options,
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor. Si estuvo inactivo puede tardar unos segundos en despertar.');
    }
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && this.#token) this.#onUnauthorized();
    if (res.status === 429 && !body.error) throw new Error('Hiciste muchas solicitudes seguidas. Espera un minuto e inténtalo de nuevo.');
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

  register(payload) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  }

  login(payload) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  }

  me() {
    return this.request('/auth/me');
  }

  previewRemodel(payload) {
    return this.request('/remodels/preview', { method: 'POST', body: JSON.stringify(payload) });
  }
}

export const api = ApiClient.getInstance();
