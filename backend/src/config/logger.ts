import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { config } from './index';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (config.server.isDevelopment) {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat,
    })
  );
}

// File transport (enabled in production or when LOG_FILE is specified)
if (config.server.isProduction || config.logging.file) {
  // Ensure logs directory exists
  const logDir = path.dirname(config.logging.file);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: config.logging.file.replace('.log', '-error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      level: config.logging.level,
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  levels,
  level: config.logging.level,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create request logger for Express
export const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/requests.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Helper functions for structured logging
export const loggers = {
  // Authentication logs
  auth: {
    login: (userId: string, email: string, success: boolean, ip?: string) => {
      logger.info('Authentication attempt', {
        type: 'auth_login',
        userId,
        email,
        success,
        ip,
        timestamp: new Date().toISOString(),
      });
    },
    register: (userId: string, email: string, role: string) => {
      logger.info('User registration', {
        type: 'auth_register',
        userId,
        email,
        role,
        timestamp: new Date().toISOString(),
      });
    },
    logout: (userId: string) => {
      logger.info('User logout', {
        type: 'auth_logout',
        userId,
        timestamp: new Date().toISOString(),
      });
    },
  },

  // API request logs
  api: {
    request: (method: string, url: string, userId?: string, ip?: string) => {
      requestLogger.info('API request', {
        type: 'api_request',
        method,
        url,
        userId,
        ip,
        timestamp: new Date().toISOString(),
      });
    },
    error: (method: string, url: string, error: string, userId?: string) => {
      logger.error('API error', {
        type: 'api_error',
        method,
        url,
        error,
        userId,
        timestamp: new Date().toISOString(),
      });
    },
  },

  // Database logs
  database: {
    query: (operation: string, model: string, duration?: number) => {
      logger.debug('Database query', {
        type: 'db_query',
        operation,
        model,
        duration,
        timestamp: new Date().toISOString(),
      });
    },
    error: (operation: string, model: string, error: string) => {
      logger.error('Database error', {
        type: 'db_error',
        operation,
        model,
        error,
        timestamp: new Date().toISOString(),
      });
    },
  },

  // Payment logs
  payment: {
    attempt: (paymentId: string, amount: number, method: string, userId: string) => {
      logger.info('Payment attempt', {
        type: 'payment_attempt',
        paymentId,
        amount,
        method,
        userId,
        timestamp: new Date().toISOString(),
      });
    },
    success: (paymentId: string, transactionId: string, amount: number) => {
      logger.info('Payment success', {
        type: 'payment_success',
        paymentId,
        transactionId,
        amount,
        timestamp: new Date().toISOString(),
      });
    },
    failure: (paymentId: string, error: string, amount: number) => {
      logger.error('Payment failure', {
        type: 'payment_failure',
        paymentId,
        error,
        amount,
        timestamp: new Date().toISOString(),
      });
    },
  },

  // Security logs
  security: {
    rateLimitExceeded: (ip: string, endpoint: string) => {
      logger.warn('Rate limit exceeded', {
        type: 'security_rate_limit',
        ip,
        endpoint,
        timestamp: new Date().toISOString(),
      });
    },
    suspiciousActivity: (userId: string, activity: string, details: any) => {
      logger.warn('Suspicious activity detected', {
        type: 'security_suspicious',
        userId,
        activity,
        details,
        timestamp: new Date().toISOString(),
      });
    },
  },
};

export default logger;
