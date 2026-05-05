import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSupabaseConfigError, supabase } from "./supabase";

const getApiBaseUrl = (): string => {
  // Optional external API base URL for non-Supabase endpoints (for example chat backends).
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    console.warn("VITE_API_BASE_URL is not configured");
    return "";
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export const extractErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<any>;
  const responseData = axiosError?.response?.data;

  // 1. If the response data is a plain string, use it.
  if (typeof responseData === "string" && responseData.trim().length > 0) {
    return responseData;
  }

  // 2. Check for common JSON error structures.
  if (responseData && typeof responseData === "object") {
    // Standard Strapi/CMS format: response.data.error.message
    if (responseData.error?.message) {
      return responseData.error.message;
    }
    
    // .NET / Custom API common formats
    if (responseData.message) {
      return responseData.message;
    }
    
    if (responseData.errorMessage) {
      return responseData.errorMessage;
    }

    if (responseData.msg) {
      return responseData.msg;
    }

    if (responseData.error_description) {
      return responseData.error_description;
    }

    // Handle validation errors list
    if (
      Array.isArray(responseData.error?.details?.errors) &&
      responseData.error.details.errors.length > 0
    ) {
      return responseData.error.details.errors[0].message;
    }
    
    // Handle .NET validation errors object (e.g., { errors: { field: ["msg"] } })
    if (responseData.errors && typeof responseData.errors === "object") {
      const firstKey = Object.keys(responseData.errors)[0];
      const fieldErrors = responseData.errors[firstKey];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        return fieldErrors[0];
      }
    }
  }

  // 3. Fallback to axios error message, but filter out generic "status code" noise if possible.
  if (error instanceof Error && error.message) {
    const msg = error.message;
    // If it's just the status code message, we might want a friendlier default
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("status code") || lowerMsg.includes("status ") || /^\d{3}\b/.test(lowerMsg)) {
      const status = axiosError.response?.status;
      if (status === 401) return "Unauthorized: Please check your credentials.";
      if (status === 403) return "Forbidden: You don't have permission to perform this action.";
      if (status === 404) return "Resource not found.";
      if (status === 500) return "Internal Server Error: Please try again later.";
    }
    return msg;
  }

  return "Request failed. Please try again.";
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

apiClient.interceptors.request.use((config) => {
  return config;
});

apiClient.interceptors.request.use(async (config) => {
  const skipAuth =
    (config as AxiosRequestConfig & { skipAuth?: boolean }).skipAuth === true;
  if (skipAuth) {
    return config;
  }

  // Prefer the .NET JWT (stored by the student login flow) when present.
  // This is required for /api/chat/* and all .NET backend endpoints.
  const dotnetToken = localStorage.getItem("auth_token");
  if (dotnetToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${dotnetToken}`;
    return config;
  }

  // Fallback: attach Supabase session token for Supabase-backed endpoints.
  // Keep API calls working even when local auth storage is empty.
  if (getSupabaseConfigError()) {
    return config;
  }

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn(
      "Failed to read local API session for Authorization header.",
      error,
    );
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(extractErrorMessage(error)));
  },
);

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  auth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const config: AxiosRequestConfig & { skipAuth?: boolean } = {
    url: endpoint,
    method: options.method || "GET",
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
