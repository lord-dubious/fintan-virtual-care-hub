import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from root directory
dotenv.config({ path: "../.env" });

// Environment validation schema
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),
  HOST: z.string().default("0.0.0.0"), // Bind address
  BACKEND_HOST: z.string().optional(), // External host for URL construction

  // Frontend Configuration
  FRONTEND_HOST: z.string().optional(),
  FRONTEND_PORT: z.string().transform(Number).optional(),
  CORS_ORIGIN: z.string().optional(), // If set, restricts CORS to specific origins

  // Database Configuration
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),

  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // Daily.co Configuration
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),

  // Payment Configuration
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),

  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  FROM_NAME: z.string().optional(),

  // SMS Configuration
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Security Configuration
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default("12"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),

  // Logging Configuration
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().default("logs/app.log"),

  // Feature Flags
  ENABLE_REGISTRATION: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_EMAIL_VERIFICATION: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_SMS_NOTIFICATIONS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_EMAIL_NOTIFICATIONS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_PAYMENT_PROCESSING: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_VIDEO_CONSULTATIONS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_AUDIO_CONSULTATIONS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().transform(Number).default("10485760"), // 10MB
  ALLOWED_FILE_TYPES: z.string().default("pdf,jpg,jpeg,png,doc,docx"),

  // Health Check Configuration
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).default("30000"),
  DATABASE_HEALTH_CHECK_TIMEOUT: z.string().transform(Number).default("5000"),

  // External Service Timeouts
  DAILY_API_TIMEOUT: z.string().transform(Number).default("10000"),
  STRIPE_API_TIMEOUT: z.string().transform(Number).default("10000"),
  PAYSTACK_API_TIMEOUT: z.string().transform(Number).default("10000"),
  SMTP_TIMEOUT: z.string().transform(Number).default("10000"),
  TWILIO_TIMEOUT: z.string().transform(Number).default("10000"),
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

// Dynamic URL construction helpers - NO HARDCODING
const getServerHost = () => {
  // Always use BACKEND_HOST if explicitly set
  if (env.BACKEND_HOST) {
    return env.BACKEND_HOST;
  }

  // Auto-detect host from various hosting platforms
  const detectedHost =
    process.env.RENDER_EXTERNAL_HOSTNAME || // Render.com
    process.env.RAILWAY_PUBLIC_DOMAIN || // Railway
    process.env.VERCEL_URL || // Vercel
    (process.env.HEROKU_APP_NAME
      ? `${process.env.HEROKU_APP_NAME}.herokuapp.com`
      : null) || // Heroku
    (process.env.FLY_APP_NAME ? `${process.env.FLY_APP_NAME}.fly.dev` : null) || // Fly.io
    process.env.HOST_IP || // Custom host IP
    "0.0.0.0"; // Final fallback - bind to all interfaces

  return detectedHost;
};

const getProtocol = () => {
  const host = getServerHost();

  // Force HTTPS if explicitly set
  if (process.env.FORCE_HTTPS === 'true') {
    return 'https';
  }

  // Use HTTP for local development (localhost, 127.0.0.1, any IP address, or 0.0.0.0)
  // Use HTTPS for hosted domains
  const isLocalDevelopment =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host === "0.0.0.0";

  return isLocalDevelopment ? "http" : "https";
};

const getFrontendHost = () => {
  if (env.FRONTEND_HOST) {
    return env.FRONTEND_HOST;
  }
  return getServerHost(); // Default to same as backend
};

// Helper to construct URLs - always include port for backend services
const getBackendURL = () => {
  const host = getServerHost();
  const protocol = getProtocol();

  // Always include port for backend services (they support custom ports)
  return `${protocol}://${host}:${env.PORT}`;
};

const getFrontendURL = () => {
  const host = getFrontendHost();
  const protocol = getProtocol();
  const port = env.FRONTEND_PORT || env.PORT + 7000;

  // For local development (localhost, 127.0.0.1, IP addresses, or 0.0.0.0), always include port
  if (
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host === "0.0.0.0"
  ) {
    return `${protocol}://${host}:${port}`;
  }

  // For hosted services, include port if FRONTEND_PORT is explicitly set
  if (env.FRONTEND_PORT) {
    return `${protocol}://${host}:${port}`;
  }

  // For hosted services without explicit port, assume standard ports
  return `${protocol}://${host}`;
};

// Configuration object
export const config = {
  // Server
  server: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    backendHost: getServerHost(),
    protocol: getProtocol(),
    apiBaseUrl: `${getBackendURL()}/api`,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },

  // Frontend
  frontend: {
    host: getFrontendHost(),
    port: env.FRONTEND_PORT || env.PORT + 7000,
    url: getFrontendURL(),
    corsOrigin: env.CORS_ORIGIN, // If undefined, allows all origins
  },

  // Database
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
    healthCheckTimeout: env.DATABASE_HEALTH_CHECK_TIMEOUT,
  },

  // Authentication
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  },

  // Daily.co
  daily: {
    apiKey: env.DAILY_API_KEY,
    domain: env.DAILY_DOMAIN,
    timeout: env.DAILY_API_TIMEOUT,
  },

  // Payments
  payments: {
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      timeout: env.STRIPE_API_TIMEOUT,
    },
    paystack: {
      secretKey: env.PAYSTACK_SECRET_KEY,
      timeout: env.PAYSTACK_API_TIMEOUT,
    },
    paypal: {
      clientId: env.PAYPAL_CLIENT_ID,
      clientSecret: env.PAYPAL_CLIENT_SECRET,
    },
    flutterwave: {
      secretKey: env.FLUTTERWAVE_SECRET_KEY,
    },
  },

  // Email
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      timeout: env.SMTP_TIMEOUT,
    },
    from: {
      email: env.FROM_EMAIL,
      name: env.FROM_NAME,
    },
  },

  // SMS
  sms: {
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
      timeout: env.TWILIO_TIMEOUT,
    },
  },

  // Security
  security: {
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },

  // Features
  features: {
    registration: env.ENABLE_REGISTRATION,
    emailVerification: env.ENABLE_EMAIL_VERIFICATION,
    smsNotifications: env.ENABLE_SMS_NOTIFICATIONS,
    emailNotifications: env.ENABLE_EMAIL_NOTIFICATIONS,
    paymentProcessing: env.ENABLE_PAYMENT_PROCESSING,
    videoConsultations: env.ENABLE_VIDEO_CONSULTATIONS,
    audioConsultations: env.ENABLE_AUDIO_CONSULTATIONS,
  },

  // File Upload
  fileUpload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(",")
      .map((type) => type.trim())
      .filter(Boolean),
  },

  // Health Check
  healthCheck: {
    interval: env.HEALTH_CHECK_INTERVAL,
  },
} as const;

export default config;
