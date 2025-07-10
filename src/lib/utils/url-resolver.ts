/**
 * Shared URL resolution utility for consistent backend URL construction
 * across the application. This consolidates the logic that was duplicated
 * in multiple files.
 */

export interface URLResolverOptions {
  /** Whether to append '/api' to the resolved URL */
  includeApiPath?: boolean;
  /** Default port to use for local development */
  defaultPort?: string;
  /** Fallback URL if no configuration is found */
  fallbackUrl?: string;
}

/**
 * Determines the protocol to use based on the host
 */
export const getProtocolForHost = (host: string): string => {
  return host.includes("localhost") ||
         host.includes("127.0.0.1") ||
         /^\d+\.\d+\.\d+\.\d+$/.test(host)
    ? "http"
    : "https";
};

/**
 * Resolves the backend URL using a priority-based approach:
 * 1. VITE_BACKEND_URL (full URL override)
 * 2. VITE_BACKEND_HOST + VITE_BACKEND_PORT (host + port configuration)
 * 3. Auto-detection from window.location (browser environment)
 * 4. Fallback URL
 */
export const resolveBackendURL = (options: URLResolverOptions = {}): string => {
  const {
    includeApiPath = false,
    defaultPort = "3000",
    fallbackUrl = "http://0.0.0.0:3000"
  } = options;

  // PRIORITY 1: Full URL override
  if (import.meta.env.VITE_BACKEND_URL) {
    let url = import.meta.env.VITE_BACKEND_URL;
    // Remove trailing slash to prevent double slashes
    url = url.replace(/\/$/, '');
    return includeApiPath ? `${url}/api` : url;
  }

  // PRIORITY 2: Host + Port configuration
  if (import.meta.env.VITE_BACKEND_HOST) {
    const host = import.meta.env.VITE_BACKEND_HOST;
    const port = import.meta.env.VITE_BACKEND_PORT || defaultPort;

    // If host already includes protocol, use it as-is
    if (host.startsWith("http")) {
      const url = host.replace(/\/$/, '');
      return includeApiPath ? `${url}/api` : url;
    }

    const protocol = getProtocolForHost(host);

    // For local hosts, include port
    if (
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host)
    ) {
      const url = `${protocol}://${host}:${port}`;
      return includeApiPath ? `${url}/api` : url;
    }

    // For remote hosts, don't include port (assume standard ports)
    const url = `${protocol}://${host}`;
    return includeApiPath ? `${url}/api` : url;
  }

  // PRIORITY 3: Auto-detection from browser location
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;

    // For local development, backend is typically on port 3000
    if (
      currentHost.includes("localhost") ||
      currentHost.includes("127.0.0.1") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(currentHost)
    ) {
      const url = `${currentProtocol}//${currentHost}:${defaultPort}`;
      return includeApiPath ? `${url}/api` : url;
    }

    // For hosted domains, backend is typically on the same domain
    const url = `${currentProtocol}//${currentHost}`;
    return includeApiPath ? `${url}/api` : url;
  }

  // PRIORITY 4: Fallback
  const url = fallbackUrl.replace(/\/$/, '');
  return includeApiPath ? `${url}/api` : url;
};

/**
 * Gets the API base URL (backend URL + /api)
 */
export const getAPIBaseURL = (): string => {
  return resolveBackendURL({ includeApiPath: true });
};

/**
 * Gets the backend base URL (without /api)
 */
export const getBackendBaseURL = (): string => {
  return resolveBackendURL({ includeApiPath: false });
};

/**
 * Token storage keys - centralized to avoid inconsistencies
 */
export const TOKEN_STORAGE_KEY = "auth_token";
export const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
export const USER_STORAGE_KEY = "current_user";

/**
 * Validates if a URL is properly formatted
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Normalizes a URL by removing trailing slashes and ensuring proper format
 */
export const normalizeURL = (url: string): string => {
  if (!url) return url;
  
  // Remove trailing slash
  let normalized = url.replace(/\/$/, '');
  
  // Ensure protocol is present
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    // Default to https for non-local URLs
    const protocol = normalized.includes('localhost') || 
                    normalized.includes('127.0.0.1') || 
                    /^\d+\.\d+\.\d+\.\d+/.test(normalized) ? 'http' : 'https';
    normalized = `${protocol}://${normalized}`;
  }
  
  return normalized;
};
