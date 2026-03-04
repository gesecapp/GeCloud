/**
 * HTTP API Client
 * Fetch configurado para substituir o axios seguindo o padrão do código legado
 */

import { useAuth } from '@/hooks/use-auth';

const coreUrl = import.meta.env.VITE_CORE_URL || 'http://localhost:3001';

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
  body?: any;
}

async function fetcher(baseURL: string, endpoint: string, options: ApiRequestOptions = {}) {
  const token = useAuth.getState().token;
  const { params, body, headers: customHeaders, ...rest } = options;

  // Montagem da URL com Query Params
  let url = `${baseURL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Configuração de Headers e Token
  const headers = new Headers(customHeaders);
  if (token) {
    headers.set('token', token);
  }

  const isFormData = body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const result = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };

    if (!response.ok) {
      // Propaga erro como no interceptor do axios (error.response)
      return Promise.reject({
        response: result,
      });
    }

    return result;
  } catch (error: any) {
    // Erro de rede ou configuração (error.request)
    return Promise.reject({
      request: true,
      message: error.message,
      error,
    });
  }
}

class ApiClient {
  constructor(private baseURL: string) {}

  async get<T = any>(url: string, options?: ApiRequestOptions): Promise<{ data: T; status: number; headers: Headers }> {
    return fetcher(this.baseURL, url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<{ data: T; status: number; headers: Headers }> {
    return fetcher(this.baseURL, url, { ...options, method: 'POST', body: data });
  }

  async put<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<{ data: T; status: number; headers: Headers }> {
    return fetcher(this.baseURL, url, { ...options, method: 'PUT', body: data });
  }

  async patch<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<{ data: T; status: number; headers: Headers }> {
    return fetcher(this.baseURL, url, { ...options, method: 'PATCH', body: data });
  }

  async delete<T = any>(url: string, options?: ApiRequestOptions): Promise<{ data: T; status: number; headers: Headers }> {
    return fetcher(this.baseURL, url, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(`${coreUrl}/api`);
export const cepApi = new ApiClient('https://viacep.com.br/ws');

export default api;
