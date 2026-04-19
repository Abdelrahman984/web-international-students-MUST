import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { supabase } from './supabase';

const getApiBaseUrl = (): string => {
  // Optional external API base URL for non-Supabase endpoints (for example chat backends).
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    console.warn('VITE_API_BASE_URL is not configured');
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const extractErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<any>;
  const responseData = axiosError?.response?.data;

  if (typeof responseData === 'string') {
    return responseData;
  }

  if (responseData?.error?.message) {
    return responseData.error.message;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (Array.isArray(responseData?.error?.details?.errors) && responseData.error.details.errors.length > 0) {
    return responseData.error.details.errors[0].message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Request failed. Please try again.';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

apiClient.interceptors.request.use((config) => {
  return config;
});

apiClient.interceptors.request.use(async (config) => {
  const skipAuth = (config as AxiosRequestConfig & { skipAuth?: boolean }).skipAuth === true;
  if (skipAuth) {
    return config;
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(extractErrorMessage(error)));
  }
);

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  auth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const config: AxiosRequestConfig & { skipAuth?: boolean } = {
    url: endpoint,
    method: options.method || 'GET',
    headers: options.headers,
    params: options.params,
    data: options.body,
    skipAuth: options.auth === false,
  };

  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export function getCurrentApiBaseUrl(): string {
  return getApiBaseUrl();
}
