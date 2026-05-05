import axios from "axios";
import { extractErrorMessage } from "../services/api";
import { getApiUrl } from "./api";
import { getStoredAuthToken } from "../utils/storageUtils";

export const api = axios.create({ baseURL: getApiUrl() });

api.interceptors.request.use((config) => {
  // Prefer the canonical stored token accessor, but fall back to
  // legacy keys used elsewhere in the app.
  const token =
    getStoredAuthToken() ||
    localStorage.getItem("must_auth_token") ||
    localStorage.getItem("auth_token") ||
    null;

  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(new Error(extractErrorMessage(error)));
  }
);
