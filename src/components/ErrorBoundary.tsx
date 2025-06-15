import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorTracker } from '@/lib/utils/monitoring';
import { config } from '@/lib/config/env';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    errorTracker.recordError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      metadata: {
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log to console in development
    if (config.app.environment === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = encodeURIComponent(`Bug Report - Error ID: ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Error Message: ${error?.message || 'Unknown error'}

Steps to reproduce:
1. 
2. 
3. 

Expected behavior:


Actual behavior:


Additional context:

    `.trim());
    
    window.open(`mailto:support@drfintan.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {config.app.environment === 'development' && this.state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Error Details (Development Only):
                  </p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-red-600 mt-1">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
                
                <Button
                  onClick={this.handleReportBug}
                  className="w-full"
                  variant="ghost"
                  size="sm"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {this.state.errorId && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Error ID: {this.state.errorId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please include this ID when reporting the issue
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary context
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    errorTracker.recordError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      metadata: {
        errorInfo,
        manual: true,
      },
    });

    // Re-throw the error to trigger error boundary
    throw error;
  };
}

export default ErrorBoundary;
