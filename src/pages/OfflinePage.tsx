
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflinePage = () => {
  const isMobile = useIsMobile();
  
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className={`text-center max-w-md ${isMobile ? 'w-full' : ''}`}>
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-2">You're offline</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you're not connected to the internet. Please check your connection and try again.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={handleRetry}
            className="w-full" 
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <div className="text-sm text-muted-foreground pt-4">
            <h2 className="font-medium mb-2">Things to try:</h2>
            <ul className="text-left space-y-2 pl-5 list-disc">
              <li>Check your Wi-Fi connection</li>
              <li>Check your mobile data connection</li>
              <li>Try again in a few minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
