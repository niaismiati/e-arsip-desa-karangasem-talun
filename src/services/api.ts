class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = '/api';

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: Record<string, unknown>;
    params?: Record<string, string>;
    formData?: FormData;
    timeout?: number;
  },
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};

  if (!options?.formData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = `${BASE_URL}${path}`;
  if (options?.params) {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += `?${qs}`;
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeout ?? 30000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: options?.formData ?? (options?.body ? JSON.stringify(options.body) : undefined),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Waktu permintaan habis. Silakan coba lagi.', 0);
    }
    throw new ApiError('Gagal terhubung ke server. Pastikan server backend berjalan.', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  let json: Record<string, unknown>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('Respons server tidak valid.', res.status);
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(
      (json?.message as string) || `HTTP ${res.status}`,
      res.status,
      json,
    );
  }

  return json as T;
}

export const api = {
  get: <T = { success: boolean; data: unknown }>(
    path: string,
    params?: Record<string, string>,
  ) => request<T>('GET', path, { params }),

  post: <T = { success: boolean; data: unknown }>(
    path: string,
    body?: Record<string, unknown>,
  ) => request<T>('POST', path, { body }),

  put: <T = { success: boolean; data: unknown }>(
    path: string,
    body?: Record<string, unknown>,
  ) => request<T>('PUT', path, { body }),

  patch: <T = { success: boolean; data: unknown }>(
    path: string,
    body?: Record<string, unknown>,
  ) => request<T>('PATCH', path, { body }),

  delete: <T = { success: boolean; data: unknown }>(
    path: string,
  ) => request<T>('DELETE', path),

  upload: <T = { success: boolean; data: unknown }>(
    path: string,
    method: string,
    formData: FormData,
  ) => request<T>(method, path, { formData }),
};

export { ApiError };
