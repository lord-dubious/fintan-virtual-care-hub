// Cookie-based Token Management for Enhanced Security
import { apiClient } from './client';

export interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthData {
  user: UserData;
  csrfToken: string;
}

// Cookie names (must match backend)
const CSRF_TOKEN_COOKIE = 'csrf_token';

/**
 * Cookie-based Token Manager
 * Uses HTTP-only cookies for tokens and CSRF protection
 */
export class CookieTokenManager {
  private csrfToken: string | null = null;
  private user: UserData | null = null;

  /**
   * Get CSRF token from cookie
   */
  private getCSRFTokenFromCookie(): string | null {
    try {
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${CSRF_TOKEN_COOKIE}=`)
      );
      
      if (csrfCookie) {
        return csrfCookie.split('=')[1];
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get CSRF token from cookie:', error);
      return null;
    }
  }

  /**
   * Initialize CSRF token
   */
  async initializeCSRFToken(): Promise<string | null> {
    try {
      // First try to get from cookie
      const cookieToken = this.getCSRFTokenFromCookie();
      if (cookieToken) {
        this.csrfToken = cookieToken;
        return cookieToken;
      }

      // If no cookie token, request new one
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.data.csrfToken;
        return this.csrfToken;
      }

      return null;
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
      return null;
    }
  }

  /**
   * Get current CSRF token
   */
  getCSRFToken(): string | null {
    return this.csrfToken || this.getCSRFTokenFromCookie();
  }

  /**
   * Set authentication data after login/register
   */
  setAuthData(data: AuthData): void {
    this.user = data.user;
    this.csrfToken = data.csrfToken;
  }

  /**
   * Get current user data
   */
  getUserData(): UserData | null {
    return this.user;
  }

  /**
   * Set user data
   */
  setUserData(user: UserData): void {
    this.user = user;
  }

  /**
   * Check if user is authenticated
   * Note: With HTTP-only cookies, we can't directly check token presence
   * We rely on API calls to determine auth status
   */
  isAuthenticated(): boolean {
    return this.user !== null;
  }

  /**
   * Clear authentication data
   */
  clearAuthData(): void {
    this.user = null;
    this.csrfToken = null;
  }

  /**
   * Migrate from localStorage to cookies
   * This helps users transition from the old auth system
   */
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const oldToken = localStorage.getItem('auth_token');
      const oldRefreshToken = localStorage.getItem('refresh_token');

      if (oldToken && oldRefreshToken) {
        // Call backend to set cookies
        const response = await apiClient.post('/auth/set-cookies', {
          token: oldToken,
          refreshToken: oldRefreshToken,
        });

        if (response.success && response.data) {
          // Clear old localStorage data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');

          // Set CSRF token
          this.csrfToken = (response.data as { csrfToken: string }).csrfToken;
          
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to migrate from localStorage:', error);
      return false;
    }
  }

  /**
   * Logout user (clears cookies on backend)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * Check if we should use cookie-based auth
   * Returns true if CSRF token is available (indicating cookie auth is set up)
   */
  isCookieAuthEnabled(): boolean {
    return this.getCSRFTokenFromCookie() !== null;
  }
}

// Export singleton instance
export const cookieTokenManager = new CookieTokenManager();

// Export for backward compatibility and migration
export const tokenManager = {
  // Legacy methods that now use cookies
  getAuthToken: () => null, // Tokens are now HTTP-only
  setAuthToken: (_token?: string) => {}, // No-op, tokens are set by backend
  removeAuthToken: () => {}, // No-op, use logout instead

  // Legacy methods for backward compatibility
  getRefreshToken: () => null, // Refresh tokens are now HTTP-only
  setRefreshToken: (_token?: string) => {}, // No-op
  isTokenExpired: (_token?: string) => false, // Server handles expiry

  // New cookie-based methods
  getCSRFToken: () => cookieTokenManager.getCSRFToken(),
  getUserData: () => cookieTokenManager.getUserData(),
  setUserData: (user: UserData) => cookieTokenManager.setUserData(user),
  isAuthenticated: () => cookieTokenManager.isAuthenticated(),
  clearAuthData: () => cookieTokenManager.clearAuthData(),
  getAuthHeaders: () => cookieTokenManager.getAuthHeaders(),

  // Migration and setup
  initializeCSRFToken: () => cookieTokenManager.initializeCSRFToken(),
  migrateFromLocalStorage: () => cookieTokenManager.migrateFromLocalStorage(),
  logout: () => cookieTokenManager.logout(),

  // Set auth data after login
  setAuthData: (data: AuthData) => cookieTokenManager.setAuthData(data),

  // Check if cookie auth is enabled
  isCookieAuthEnabled: () => cookieTokenManager.isCookieAuthEnabled(),
};
