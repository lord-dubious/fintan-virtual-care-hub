import { config } from '@/config';
import logger from '@/config/logger';

// Cal.com configuration
export const calcomConfig = {
  // API Configuration
  apiUrl: process.env.CALCOM_WEBAPP_URL || 'http://localhost:3001',
  apiKey: process.env.CALCOM_API_KEY,
  clientId: process.env.CALCOM_CLIENT_ID,
  clientSecret: process.env.CALCOM_CLIENT_SECRET,
  
  // Webhook Configuration
  webhookSecret: process.env.CALCOM_WEBHOOK_SECRET,
  webhookEndpoint: process.env.WEBHOOK_ENDPOINT || 'http://localhost:3000/api/calcom/webhooks',
  
  // Default Provider Configuration
  defaultProvider: {
    name: process.env.DEFAULT_PROVIDER_NAME || 'Doctor Fintan Ekochin',
    email: process.env.DEFAULT_PROVIDER_EMAIL || 'doctor@yourdomain.com',
    timezone: process.env.TIMEZONE || 'UTC',
  },
  
  // Integration Settings
  enableDailyIntegration: true,
  defaultEventDuration: 30, // minutes
  defaultBufferTime: 15, // minutes
  
  // Video Conference Settings
  videoProvider: 'daily', // 'daily', 'cal-video', 'zoom', 'google-meet'
  
  // Booking Settings
  requireConfirmation: false,
  allowRescheduling: true,
  allowCancellation: true,
  
  // Notification Settings
  sendBookingConfirmation: true,
  sendReminderEmails: true,
};

// Cal.com API client configuration
export interface CalcomApiConfig {
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  timeout: number;
  retries: number;
}

export const calcomApiConfig: CalcomApiConfig = {
  baseUrl: `${calcomConfig.apiUrl}/api/v2`,
  apiKey: calcomConfig.apiKey,
  clientId: calcomConfig.clientId,
  clientSecret: calcomConfig.clientSecret,
  timeout: 30000, // 30 seconds
  retries: 3,
};

// Event type templates for different consultation types
export const eventTypeTemplates = {
  video: {
    title: 'Video Consultation',
    description: 'Video consultation with Doctor Fintan Ekochin',
    length: 30,
    locations: [
      {
        type: 'integration',
        integration: 'daily',
      },
    ],
    requiresConfirmation: false,
    disableGuests: false,
  },
  audio: {
    title: 'Audio Consultation',
    description: 'Audio consultation with Doctor Fintan Ekochin',
    length: 30,
    locations: [
      {
        type: 'integration',
        integration: 'daily',
        // Configure for audio-only
        metadata: {
          startVideoOff: true,
        },
      },
    ],
    requiresConfirmation: false,
    disableGuests: false,
  },
  followUp: {
    title: 'Follow-up Consultation',
    description: 'Follow-up consultation with Doctor Fintan Ekochin',
    length: 15,
    locations: [
      {
        type: 'integration',
        integration: 'daily',
      },
    ],
    requiresConfirmation: false,
    disableGuests: false,
  },
};

// Webhook event types we want to handle
export const webhookEvents = [
  'BOOKING_CREATED',
  'BOOKING_RESCHEDULED',
  'BOOKING_CANCELLED',
  'BOOKING_CONFIRMED',
  'BOOKING_REJECTED',
  'MEETING_STARTED',
  'MEETING_ENDED',
  'RECORDING_READY',
] as const;

export type WebhookEventType = typeof webhookEvents[number];

// Validate Cal.com configuration
export const validateCalcomConfig = (): boolean => {
  const errors: string[] = [];

  if (!calcomConfig.apiUrl) {
    errors.push('CALCOM_WEBAPP_URL is not configured');
  }

  if (!calcomConfig.webhookSecret) {
    errors.push('CALCOM_WEBHOOK_SECRET is not configured');
  }

  if (!calcomConfig.clientId || !calcomConfig.clientSecret) {
    logger.warn('Cal.com OAuth credentials not configured. Some features may not work.');
  }

  if (!calcomConfig.apiKey) {
    logger.warn('Cal.com API key not configured. Some features may not work.');
  }

  if (errors.length > 0) {
    logger.error('Cal.com configuration errors:', errors);
    return false;
  }

  logger.info('Cal.com configuration validated successfully');
  return true;
};

// Helper function to get API headers
export const getCalcomApiHeaders = (useOAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (useOAuth && calcomConfig.clientId && calcomConfig.clientSecret) {
    headers['x-cal-client-id'] = calcomConfig.clientId;
    headers['x-cal-secret-key'] = calcomConfig.clientSecret;
  } else if (calcomConfig.apiKey) {
    headers['Authorization'] = `Bearer ${calcomConfig.apiKey}`;
  }

  return headers;
};

export default calcomConfig;
