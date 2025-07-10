// Simple API utility for making HTTP requests
import axios from "axios";
import { getAPIBaseURL, TOKEN_STORAGE_KEY } from "./utils/url-resolver";

const API_BASE_URL = getAPIBaseURL();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: (url: string, config?: object) => apiClient.get(url, config),
  post: (url: string, data?: unknown, config?: object) =>
    apiClient.post(url, data, config),
  put: (url: string, data?: unknown, config?: object) =>
    apiClient.put(url, data, config),
  patch: (url: string, data?: unknown, config?: object) =>
    apiClient.patch(url, data, config),
  delete: (url: string, config?: object) => apiClient.delete(url, config),
};

export default api;
