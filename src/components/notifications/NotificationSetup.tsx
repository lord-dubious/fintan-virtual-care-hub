
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { notificationService } from '@/services/notificationService';
import { Bell, Key, CheckCircle } from 'lucide-react';

interface NotificationSetupProps {
  onSetupComplete?: () => void;
}

const NotificationSetup: React.FC<NotificationSetupProps> = ({ onSetupComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    if (!apiKey || !clientId) return;

    setIsLoading(true);
    try {
      notificationService.initialize({
        clientId,
        apiKey
      });

      setIsConfigured(true);
      onSetupComplete?.();
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          NotificationAPI has been configured successfully! Appointment reminders and notifications are now active.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Setup Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            To enable appointment reminders and notifications, please provide your NotificationAPI credentials.
            Get them from <a href="https://docs.notificationapi.com/" target="_blank" rel="noopener noreferrer" className="text-medical-primary underline">NotificationAPI Dashboard</a>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your NotificationAPI Client ID"
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your NotificationAPI Key"
            />
          </div>

          <Button 
            onClick={handleSetup}
            disabled={!apiKey || !clientId || isLoading}
            className="w-full"
          >
            {isLoading ? 'Configuring...' : 'Setup Notifications'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSetup;
