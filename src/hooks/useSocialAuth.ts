import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { tokenManager } from '@/api/tokenManager';
import { socialAuthApi, socialAuthUtils, SocialAuthRequest, SocialAuthResponse } from '@/api/socialAuth';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Social authentication mutation
  const socialAuthMutation = useMutation({
    mutationFn: async (data: SocialAuthRequest): Promise<SocialAuthResponse> => {
      const response = await socialAuthApi.authenticateWithProvider(data);
      if (!response.success) {
        throw new Error(response.error || 'Social authentication failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Store auth data using token manager
      tokenManager.setAuthData({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user
      });

      // Update query cache
      queryClient.setQueryData(['auth', 'user'], data.user);

      toast({
        title: "Welcome!",
        description: data.isNewUser 
          ? "Account created successfully with social login"
          : "You've been signed in successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Social Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  });

  // Google authentication
  const authenticateWithGoogle = useCallback(async () => {
    if (!socialAuthUtils.isProviderConfigured('google')) {
      toast({
        title: "Google Login Unavailable",
        description: "Google authentication is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingProvider('google');

    try {
      // Check if Google API is loaded
      if (typeof window.google === 'undefined') {
        // Load Google API dynamically
        await loadGoogleAPI();
      }

      // Initialize Google OAuth
      const auth2 = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            await socialAuthMutation.mutateAsync({
              provider: 'google',
              accessToken: response.access_token
            });
          }
        }
      });

      auth2.requestAccessToken();
    } catch (error) {
      console.error('Google authentication error:', error);
      toast({
        title: "Google Login Failed",
        description: "Failed to initialize Google authentication",
        variant: "destructive",
      });
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }, [socialAuthMutation, toast]);

  // Apple authentication
  const authenticateWithApple = useCallback(async () => {
    if (!socialAuthUtils.isProviderConfigured('apple')) {
      toast({
        title: "Apple Login Unavailable",
        description: "Apple authentication is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingProvider('apple');

    try {
      // Check if Apple ID API is loaded
      if (typeof window.AppleID === 'undefined') {
        await loadAppleAPI();
      }

      // Initialize Apple ID
      window.AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: `${window.location.origin}/auth/callback/apple`,
        usePopup: true
      });

      const response = await window.AppleID.auth.signIn();
      
      if (response.authorization?.id_token) {
        await socialAuthMutation.mutateAsync({
          provider: 'apple',
          accessToken: response.authorization.code,
          idToken: response.authorization.id_token
        });
      }
    } catch (error) {
      console.error('Apple authentication error:', error);
      toast({
        title: "Apple Login Failed",
        description: "Failed to authenticate with Apple",
        variant: "destructive",
      });
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }, [socialAuthMutation, toast]);

  // Microsoft authentication
  const authenticateWithMicrosoft = useCallback(async () => {
    if (!socialAuthUtils.isProviderConfigured('microsoft')) {
      toast({
        title: "Microsoft Login Unavailable",
        description: "Microsoft authentication is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingProvider('microsoft');

    try {
      // For Microsoft, we'll use a popup window approach
      const authUrl = socialAuthUtils.generateOAuthUrl('microsoft');
      const popup = window.open(authUrl, 'microsoft-auth', 'width=500,height=600');
      
      // Listen for the popup to close or send a message
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          setLoadingProvider(null);
        }
      }, 1000);

      // Handle message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'MICROSOFT_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          
          socialAuthMutation.mutateAsync({
            provider: 'microsoft',
            accessToken: event.data.accessToken
          });
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Cleanup
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
        if (!popup?.closed) {
          popup?.close();
          setIsLoading(false);
          setLoadingProvider(null);
        }
      }, 300000); // 5 minute timeout
      
    } catch (error) {
      console.error('Microsoft authentication error:', error);
      toast({
        title: "Microsoft Login Failed",
        description: "Failed to authenticate with Microsoft",
        variant: "destructive",
      });
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }, [socialAuthMutation, toast]);

  return {
    // State
    isLoading,
    loadingProvider,
    
    // Actions
    authenticateWithGoogle,
    authenticateWithApple,
    authenticateWithMicrosoft,
    
    // Utilities
    getConfiguredProviders: socialAuthUtils.getConfiguredProviders,
    isProviderConfigured: socialAuthUtils.isProviderConfigured
  };
};

// Helper function to load Google API
const loadGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-api-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
};

// Helper function to load Apple API
const loadAppleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('apple-api-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'apple-api-script';
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Apple ID API'));
    document.head.appendChild(script);
  });
};

export default useSocialAuth;
