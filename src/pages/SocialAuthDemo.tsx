import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { CheckCircle, User, Mail, Shield, Calendar, Apple } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SocialAuthDemo: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { 
    authenticateWithGoogle, 
    authenticateWithApple, 
    authenticateWithMicrosoft,
    isLoading: socialIsLoading,
    loadingProvider,
    getConfiguredProviders 
  } = useSocialAuth();
  const { toast } = useToast();
  const [testMode, setTestMode] = useState(false);

  const configuredProviders = getConfiguredProviders();

  const handleTestSocialAuth = async (provider: string) => {
    setTestMode(true);
    
    // Simulate social authentication with mock data
    try {
      const response = await fetch('http://localhost:3000/api/auth/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider.toLowerCase(),
          accessToken: `mock-${provider.toLowerCase()}-token-${Date.now()}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Demo Authentication Successful!",
          description: `Simulated ${provider} login completed`,
        });
      }
    } catch (error) {
      toast({
        title: "Demo Error",
        description: "Failed to simulate social authentication",
        variant: "destructive"
      });
    }
    
    setTestMode(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              🔐 Social Authentication Demo
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Test the social authentication integration for Fintan Virtual Care Hub
            </p>
          </CardHeader>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
                {isLoading && <Badge variant="secondary">Loading...</Badge>}
              </div>
              
              {isAuthenticated && user && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Signed in successfully!
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Name: {user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>Email: {user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>Role: {user.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    variant="outline" 
                    size="sm"
                    className="mt-3"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Authentication Options */}
        {!isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Social Authentication Options</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose your preferred social login method
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Google */}
                <Button
                  onClick={() => authenticateWithGoogle()}
                  disabled={socialIsLoading}
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium">
                      {loadingProvider === 'google' ? 'Connecting...' : 'Continue with Google'}
                    </span>
                  </div>
                </Button>

                {/* Apple */}
                <Button
                  onClick={() => authenticateWithApple()}
                  disabled={socialIsLoading}
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Apple className="w-5 h-5" />
                    <span className="font-medium">
                      {loadingProvider === 'apple' ? 'Connecting...' : 'Continue with Apple'}
                    </span>
                  </div>
                </Button>

                {/* Microsoft */}
                <Button
                  onClick={() => authenticateWithMicrosoft()}
                  disabled={socialIsLoading}
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#00A4EF" d="M0 0h11.377v11.372H0z"/>
                      <path fill="#FFB900" d="M12.623 0H24v11.372H12.623z"/>
                      <path fill="#00A4EF" d="M0 12.628h11.377V24H0z"/>
                      <path fill="#00A4EF" d="M12.623 12.628H24V24H12.623z"/>
                    </svg>
                    <span className="font-medium">
                      {loadingProvider === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
                    </span>
                  </div>
                </Button>

                {/* Demo Mode */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Demo Mode (Test without real OAuth):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleTestSocialAuth('Google')}
                      disabled={testMode}
                      variant="secondary"
                      size="sm"
                    >
                      Test Google
                    </Button>
                    <Button
                      onClick={() => handleTestSocialAuth('Apple')}
                      disabled={testMode}
                      variant="secondary"
                      size="sm"
                    >
                      Test Apple
                    </Button>
                    <Button
                      onClick={() => handleTestSocialAuth('Microsoft')}
                      disabled={testMode}
                      variant="secondary"
                      size="sm"
                    >
                      Test Microsoft
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Google', 'Apple', 'Microsoft'].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{provider}</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Configured
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialAuthDemo;
