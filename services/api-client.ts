import { fetch } from 'expo/fetch';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  authenticated?: boolean;
};

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

let accessToken: string | null = null;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function getApiBaseUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

  if (!apiUrl) {
    throw new ApiError(
      'ATHENA needs EXPO_PUBLIC_API_URL. Copy .env.example to .env and use your computer LAN address.',
      0,
      'API_URL_MISSING',
    );
  }

  return apiUrl;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const authenticated = options.authenticated ?? true;
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (authenticated && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'Could not reach the ATHENA server. Make sure it is running and this device is on the same network.',
      0,
      'NETWORK_ERROR',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as T | ErrorPayload | null;

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload | null;
    throw new ApiError(
      errorPayload?.error?.message || 'The ATHENA server could not complete the request.',
      response.status,
      errorPayload?.error?.code,
    );
  }

  return payload as T;
}
