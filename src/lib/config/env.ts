// Environment configuration
export const config = {
  app: {
    environment: import.meta.env.MODE || 'development',
    name: 'Dr. Fintan Virtual Care Hub',
    version: '1.0.0',
  },
  api: {
    baseUrl: (() => {
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
    })(),
    timeout: 30000,
  },
  features: {
    videoCalls: import.meta.env.VITE_ENABLE_VIDEO_CALLS === 'true',
    audioCalls: import.meta.env.VITE_ENABLE_AUDIO_CALLS === 'true',
    payments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
  },
  daily: {
    domain: import.meta.env.VITE_DAILY_DOMAIN || '',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
} as const;
