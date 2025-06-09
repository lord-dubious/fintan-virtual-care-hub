
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, CheckCircle, Apple } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

interface SimpleSignOnProps {
  onAuthenticated: (email: string) => void;
  isAuthenticated: boolean;
  userEmail: string;
}

const SimpleSignOn: React.FC<SimpleSignOnProps> = ({
  onAuthenticated,
  isAuthenticated,
  userEmail
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      onAuthenticated(formData.email);
      toast({
        title: "Welcome!",
        description: "You've been signed in successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      onAuthenticated(formData.email);
      toast({
        title: "Account Created!",
        description: "Welcome to Dr. Fintan's practice",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    
    // Simulate social authentication
    setTimeout(() => {
      const mockEmail = `user@${provider}.com`;
      onAuthenticated(mockEmail);
      toast({
        title: "Welcome!",
        description: `Signed in with ${provider}`,
      });
      setSocialLoading(null);
    }, 1500);
  };

  if (isAuthenticated) {
    return (
      <Card className="dark:bg-gray-800/50 border-green-200 dark:border-green-800">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-3 text-center justify-center">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300">
                Signed in successfully
              </h4>
              <p className="text-green-600 dark:text-green-400 text-sm">
                {userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2 dark:text-white`}>
          Quick Sign In
        </h2>
        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Sign in or create an account to continue with your booking
        </p>
      </div>

      {/* Social Sign-On Buttons */}
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Continue with
          </p>
        </div>
        
        <div className="grid gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialSignIn('Google')}
            disabled={!!socialLoading}
            className={`w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${isMobile ? 'h-11' : 'h-12'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                {socialLoading === 'Google' ? 'Connecting...' : 'Continue with Google'}
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSocialSignIn('Apple')}
            disabled={!!socialLoading}
            className={`w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${isMobile ? 'h-11' : 'h-12'}`}
          >
            <div className="flex items-center gap-3">
              <Apple className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                {socialLoading === 'Apple' ? 'Connecting...' : 'Continue with Apple'}
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSocialSignIn('Microsoft')}
            disabled={!!socialLoading}
            className={`w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${isMobile ? 'h-11' : 'h-12'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
                <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z"/>
                <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z"/>
                <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
              </svg>
              <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                {socialLoading === 'Microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
              </span>
            </div>
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-9' : 'h-10'}`}>
          <TabsTrigger value="signin" className={isMobile ? 'text-xs' : 'text-sm'}>
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className={isMobile ? 'text-xs' : 'text-sm'}>
            Create Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-6">
          <Card className="dark:bg-gray-800/50">
            <CardContent className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="dark:text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="dark:text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                  />
                </div>
              </div>

              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className={`w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup" className="mt-6">
          <Card className="dark:bg-gray-800/50">
            <CardContent className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname" className="dark:text-gray-200">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-firstname"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-lastname" className="dark:text-gray-200">
                    Last Name
                  </Label>
                  <Input
                    id="signup-lastname"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="dark:text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="dark:text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                  />
                </div>
              </div>

              <Button
                onClick={handleSignUp}
                disabled={isLoading}
                className={`w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleSignOn;
