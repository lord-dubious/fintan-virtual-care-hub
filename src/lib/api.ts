// Simple API utility for making HTTP requests
import axios from 'axios';

// Dynamic API URL construction
const getAPIBaseURL = () => {
  const host = import.meta.env.VITE_BACKEND_HOST || 'localhost';
  const port = import.meta.env.VITE_BACKEND_PORT || '3000';
  const protocol = (host === 'localhost' || host.includes('127.0.0.1') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) ? 'http' : 'https';

  if (host.startsWith('http')) {
    return `${host}/api`;
  }

  if (host === 'localhost' || host.includes('127.0.0.1') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return `${protocol}://${host}:${port}/api`;
  }

  return `${protocol}://${host}/api`;
};

const API_BASE_URL = getAPIBaseURL();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  patch: (url: string, data?: any, config?: any) => apiClient.patch(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),
};

export default api;
