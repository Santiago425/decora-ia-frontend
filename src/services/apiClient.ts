import { config } from '../config';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown; timeoutMs?: number };

const isForm = (body: unknown): body is FormData => typeof FormData !== 'undefined' && body instanceof FormData;

const NETWORK_ERROR = 'No pudimos conectar con el servidor. Si estuvo inactivo, puede tardar unos segundos en despertar.';

// Singleton: one HTTP client shared by the whole app, holding the session token.
export class ApiClient {
  static #instance: ApiClient | null = null;

  static getInstance(): ApiClient {
    ApiClient.#instance ??= new ApiClient(config.apiBaseUrl, config.requestTimeoutMs);
    return ApiClient.#instance;
  }

  #token: string | null = null;
  #unauthorizedHandler: () => void = () => {};

  private constructor(readonly baseUrl: string, private readonly timeoutMs: number) {}

  setToken(token: string | null): void {
    this.#token = token;
  }

  onUnauthorized(handler: () => void): void {
    this.#unauthorizedHandler = handler;
  }

  async request<T>(path: string, { body, timeoutMs, headers, ...init }: RequestOptions = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          ...(body !== undefined && !isForm(body) && { 'Content-Type': 'application/json' }),
          ...(this.#token && { Authorization: `Bearer ${this.#token}` }),
          ...headers,
        },
        body: body === undefined ? undefined : isForm(body) ? body : JSON.stringify(body),
        credentials: 'omit',
        signal: AbortSignal.timeout(timeoutMs ?? this.timeoutMs),
      });
    } catch {
      throw new ApiError(NETWORK_ERROR, 0);
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && this.#token) this.#unauthorizedHandler();
    if (!response.ok) {
      const detail = typeof data.detail === 'string' ? data.detail : `Error ${response.status}`;
      throw new ApiError(detail, response.status);
    }
    return data as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }
}

export const apiClient = ApiClient.getInstance();
