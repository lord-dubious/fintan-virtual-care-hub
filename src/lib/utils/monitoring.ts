// Simple error tracking utility
interface ErrorData {
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  metadata?: any;
}

class ErrorTracker {
  private errors: ErrorData[] = [];

  recordError(errorData: ErrorData) {
    // Store error locally
    this.errors.push(errorData);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorData);
    }
    
    // In production, you could send to a monitoring service
    // For now, we'll just store locally
  }

  getErrors(): ErrorData[] {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();
