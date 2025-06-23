// Token Management Utilities for Dr. Fintan Virtual Care Hub
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './config';

export interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

// Token storage utilities
export const tokenManager = {
  // Set authentication token
  setAuthToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  },

  // Get authentication token
  getAuthToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  },

  // Remove authentication token
  removeAuthToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  },

  // Set refresh token
  setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  },

  // Get refresh token
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  },

  // Remove refresh token
  removeRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  },

  // Set user data
  setUserData(user: UserData): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  },

  // Get user data
  getUserData(): UserData | null {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  },

  // Remove user data
  removeUserData(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  },

  // Set complete authentication data
  setAuthData(data: { token: string; refreshToken?: string; user: UserData }): void {
    this.setAuthToken(data.token);
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }
    this.setUserData(data.user);
  },

  // Clear all authentication data
  clearAuthData(): void {
    this.removeAuthToken();
    this.removeRefreshToken();
    this.removeUserData();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },

  // Get user role
  getUserRole(): string | null {
    const user = this.getUserData();
    return user?.role || null;
  },

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  },

  // Decode JWT token (basic decode without verification)
  decodeToken(token?: string): any {
    try {
      const tokenToUse = token || this.getAuthToken();
      if (!tokenToUse) return null;

      const base64Url = tokenToUse.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired(token?: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  },

  // Get token expiration time
  getTokenExpiration(token?: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;

      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Failed to get token expiration:', error);
      return null;
    }
  },
};

export default tokenManager;
