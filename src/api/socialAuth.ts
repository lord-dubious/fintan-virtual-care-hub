import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { AuthResponse } from './auth';

export interface SocialAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SocialAuthRequest {
  provider: string;
  accessToken: string;
  idToken?: string;
}

export interface SocialAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

// Social authentication providers configuration
export const SOCIAL_PROVIDERS: SocialAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    color: '#4285F4'
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: 'apple',
    color: '#000000'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: 'microsoft',
    color: '#00A4EF'
  }
];

// Social Auth API
export const socialAuthApi = {
  // Authenticate with social provider
  async authenticateWithProvider(data: SocialAuthRequest): Promise<ApiResponse<SocialAuthResponse>> {
    return apiClient.post<SocialAuthResponse>(`${API_ENDPOINTS.AUTH.BASE}/social`, data);
  },

  // Get social auth configuration
  async getProviderConfig(provider: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.get(`${API_ENDPOINTS.AUTH.BASE}/social/config/${provider}`);
  },

  // Link social account to existing user
  async linkSocialAccount(data: SocialAuthRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${API_ENDPOINTS.AUTH.BASE}/social/link`, data);
  },

  // Unlink social account
  async unlinkSocialAccount(provider: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${API_ENDPOINTS.AUTH.BASE}/social/unlink/${provider}`);
  }
};

// Google OAuth configuration
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  scope: 'openid email profile',
  redirectUri: `${window.location.origin}/auth/callback/google`
};

// Apple OAuth configuration  
export const APPLE_CONFIG = {
  clientId: import.meta.env.VITE_APPLE_CLIENT_ID || '',
  scope: 'name email',
  redirectUri: `${window.location.origin}/auth/callback/apple`
};

// Microsoft OAuth configuration
export const MICROSOFT_CONFIG = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  authority: 'https://login.microsoftonline.com/common',
  scope: 'openid email profile',
  redirectUri: `${window.location.origin}/auth/callback/microsoft`
};

// Social authentication utilities
export const socialAuthUtils = {
  // Check if provider is configured
  isProviderConfigured(provider: string): boolean {
    switch (provider) {
      case 'google':
        return !!GOOGLE_CONFIG.clientId;
      case 'apple':
        return !!APPLE_CONFIG.clientId;
      case 'microsoft':
        return !!MICROSOFT_CONFIG.clientId;
      default:
        return false;
    }
  },

  // Get configured providers
  getConfiguredProviders(): SocialAuthProvider[] {
    return SOCIAL_PROVIDERS.filter(provider => 
      this.isProviderConfigured(provider.id)
    );
  },

  // Generate OAuth URL
  generateOAuthUrl(provider: string): string {
    switch (provider) {
      case 'google':
        return `https://accounts.google.com/oauth/authorize?` +
          `client_id=${GOOGLE_CONFIG.clientId}&` +
          `redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.redirectUri)}&` +
          `scope=${encodeURIComponent(GOOGLE_CONFIG.scope)}&` +
          `response_type=code&` +
          `access_type=offline`;
      
      case 'apple':
        return `https://appleid.apple.com/auth/authorize?` +
          `client_id=${APPLE_CONFIG.clientId}&` +
          `redirect_uri=${encodeURIComponent(APPLE_CONFIG.redirectUri)}&` +
          `scope=${encodeURIComponent(APPLE_CONFIG.scope)}&` +
          `response_type=code&` +
          `response_mode=form_post`;
      
      case 'microsoft':
        return `${MICROSOFT_CONFIG.authority}/oauth2/v2.0/authorize?` +
          `client_id=${MICROSOFT_CONFIG.clientId}&` +
          `redirect_uri=${encodeURIComponent(MICROSOFT_CONFIG.redirectUri)}&` +
          `scope=${encodeURIComponent(MICROSOFT_CONFIG.scope)}&` +
          `response_type=code`;
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
};

export default socialAuthApi;
