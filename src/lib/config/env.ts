// Environment configuration
import { getAPIBaseURL } from '../utils/url-resolver';

export const config = {
  app: {
    environment: import.meta.env.MODE || "development",
    name: "Dr. Fintan Virtual Care Hub",
    version: "1.0.0",
  },
  api: {
    baseUrl: getAPIBaseURL(),
    timeout: 30000,
  },
  features: {
    videoCalls: import.meta.env.VITE_ENABLE_VIDEO_CALLS === "true",
    audioCalls: import.meta.env.VITE_ENABLE_AUDIO_CALLS === "true",
    payments: import.meta.env.VITE_ENABLE_PAYMENTS === "true",
  },
  daily: {
    domain: import.meta.env.VITE_DAILY_DOMAIN || "",
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  },
} as const;
