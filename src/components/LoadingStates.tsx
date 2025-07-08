import React from 'react';
import { Loader2, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Full page loading spinner
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// Dashboard loading skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Content cards skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Inline loading spinner
export const InlineLoader: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-2 text-blue-600`} />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
};

// Error state component
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ 
  title = "Something went wrong",
  message = "Unable to load data. Please try again.",
  onRetry,
  showRetry = true
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      {showRetry && (
        <Button onClick={onRetry || (() => window.location.reload())}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  </div>
);

// Network status indicator
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        You're offline. Some features may not work properly.
      </div>
    </div>
  );
};

// Empty state component
export const EmptyState: React.FC<{
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}> = ({ title, message, action, icon }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  </div>
);

// Loading overlay for forms
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}> = ({ isLoading, message = "Processing...", children }) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    )}
  </div>
);

// Retry button component
export const RetryButton: React.FC<{
  onRetry: () => void;
  isRetrying?: boolean;
  disabled?: boolean;
}> = ({ onRetry, isRetrying = false, disabled = false }) => (
  <Button 
    onClick={onRetry} 
    disabled={disabled || isRetrying}
    variant="outline"
    size="sm"
  >
    <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
    {isRetrying ? 'Retrying...' : 'Retry'}
  </Button>
);

// Progressive loading component
export const ProgressiveLoader: React.FC<{
  steps: string[];
  currentStep: number;
}> = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`text-sm ${
              index === currentStep 
                ? 'text-blue-600 font-medium' 
                : index < currentStep 
                  ? 'text-green-600' 
                  : 'text-gray-400'
            }`}
          >
            {index < currentStep ? '✓' : index === currentStep ? '⏳' : '○'} {step}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Timeout error component
export const TimeoutError: React.FC<{
  onRetry: () => void;
  timeout?: number;
}> = ({ onRetry, timeout = 30 }) => (
  <ErrorState
    title="Request Timeout"
    message={`The request took longer than ${timeout} seconds. Please check your connection and try again.`}
    onRetry={onRetry}
  />
);
