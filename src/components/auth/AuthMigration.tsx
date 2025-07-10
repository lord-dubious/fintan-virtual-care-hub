import React from "react";
import { useEffect, useState } from 'react';
import { tokenManager } from '@/api/cookieTokenManager';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthMigrationProps {
  onMigrationComplete?: () => void;
}

export const AuthMigration: React.FC<AuthMigrationProps> = ({ onMigrationComplete }) => {
  const [migrationStatus, setMigrationStatus] = useState<'checking' | 'needed' | 'completed' | 'failed'>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      // Check if user has old localStorage tokens
      const hasOldTokens = localStorage.getItem('auth_token') || localStorage.getItem('refresh_token');
      
      // Check if cookie-based auth is already set up
      const hasCookieAuth = tokenManager.isCookieAuthEnabled();

      if (hasOldTokens && !hasCookieAuth) {
        setMigrationStatus('needed');
      } else {
        setMigrationStatus('completed');
        onMigrationComplete?.();
      }
    } catch (error) {
      console.error('Migration check failed:', error);
      setMigrationStatus('completed'); // Assume no migration needed if check fails
      onMigrationComplete?.();
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      const success = await tokenManager.migrateFromLocalStorage();
      
      if (success) {
        setMigrationStatus('completed');
        toast({
          title: "Security Upgrade Complete",
          description: "Your authentication has been upgraded to use secure HTTP-only cookies.",
        });
        onMigrationComplete?.();
      } else {
        setMigrationStatus('failed');
        toast({
          title: "Migration Failed",
          description: "Please try logging in again to complete the security upgrade.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('failed');
      toast({
        title: "Migration Error",
        description: "An error occurred during the security upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipMigration = () => {
    // Clear old tokens and proceed
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    setMigrationStatus('completed');
    onMigrationComplete?.();
    
    toast({
      title: "Migration Skipped",
      description: "Please log in again to use the new secure authentication.",
    });
  };

  if (migrationStatus === 'checking' || migrationStatus === 'completed') {
    return null; // Don't render anything
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold">Security Upgrade Available</h2>
        </div>

        {migrationStatus === 'needed' && (
          <>
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                We've upgraded our authentication system to use secure HTTP-only cookies for better protection against XSS attacks.
                Would you like to upgrade your current session?
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleMigration} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Upgrading...' : 'Upgrade Security'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSkipMigration}
                disabled={isLoading}
                className="w-full"
              >
                Skip (Login Again Required)
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              This upgrade enhances security by storing authentication tokens in HTTP-only cookies that cannot be accessed by JavaScript.
            </p>
          </>
        )}

        {migrationStatus === 'failed' && (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The security upgrade failed. You may need to log in again to continue using the application securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleMigration} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Retrying...' : 'Try Again'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSkipMigration}
                disabled={isLoading}
                className="w-full"
              >
                Continue Without Upgrade
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthMigration;
