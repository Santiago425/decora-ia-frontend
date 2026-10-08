const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

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
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || body.database || `HTTP ${res.status}`);
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

  previewRemodel(payload) {
    return this.request('/remodels/preview', { method: 'POST', body: JSON.stringify(payload) });
  }
}

export const api = ApiClient.getInstance();
