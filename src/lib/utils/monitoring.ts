// Simple error tracking utility
interface ErrorData {
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown; // Add index signature
}

// A simple logger for demonstration. In a real app, this would be a more robust library like Winston or pino.
class Logger {
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      const timestamp = new Date().toISOString();
      console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
    }
    // In production, send to a centralized logging service (e.g., Sentry, Datadog, ELK stack)
    // For now, we'll just log to console in dev.
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();

class ErrorTracker {
  private errors: ErrorData[] = [];

  recordError(errorData: ErrorData) {
    // Store error locally
    this.errors.push(errorData);
    
    // Log error using the new logger
    logger.error('Error tracked:', errorData);
    
    // In production, send to a monitoring service (e.g., Sentry, Bugsnag)
  }

  getErrors(): ErrorData[] {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();
