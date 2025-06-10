
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationConfig {
  userId: string;
  clientId: string;
  enabled: boolean;
}

const NotificationSetup: React.FC = () => {
  const [config, setConfig] = useState<NotificationConfig>({
    userId: '',
    clientId: '',
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Notification config:', config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={config.userId}
              onChange={(e) => setConfig({ ...config, userId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            />
          </div>
          <Button type="submit">Save Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationSetup;
