// Simple API utility for making HTTP requests
import axios from "axios";

// Dynamic API URL construction - AUTO-DETECT EVERYTHING
const getAPIBaseURL = () => {
  // If explicitly set, use it
  if (import.meta.env.VITE_BACKEND_HOST) {
    const host = import.meta.env.VITE_BACKEND_HOST;
    const port = import.meta.env.VITE_BACKEND_PORT || "3000";
    const protocol =
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host)
        ? "http"
        : "https";

    if (host.startsWith("http")) {
      return `${host}/api`;
    }

    if (
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host)
    ) {
      return `${protocol}://${host}:${port}/api`;
    }

    return `${protocol}://${host}/api`;
  }

  // Auto-detect from current window location
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;

    if (
      currentHost.includes("localhost") ||
      currentHost.includes("127.0.0.1") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(currentHost)
    ) {
      return `${currentProtocol}//${currentHost}:3000/api`;
    }

    return `${currentProtocol}//${currentHost}/api`;
  }

  return import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://0.0.0.0:3000/api";
};

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
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
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
