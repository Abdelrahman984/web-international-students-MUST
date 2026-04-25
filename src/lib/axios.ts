import axios from "axios";
import { getApiUrl } from "./api";

export const api = axios.create({ baseURL: getApiUrl() });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
