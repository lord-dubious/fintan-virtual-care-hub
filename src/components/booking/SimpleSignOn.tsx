
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, CheckCircle, Apple, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
        title: "Welcome back!",
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
    
    // Simulate different OAuth flows
    setTimeout(() => {
      let mockEmail = '';
      switch(provider) {
        case 'Google':
          mockEmail = `user.${Date.now()}@gmail.com`;
          break;
        case 'Apple':
          mockEmail = `user.${Date.now()}@icloud.com`;
          break;
        case 'Microsoft':
          mockEmail = `user.${Date.now()}@outlook.com`;
          break;
        default:
          mockEmail = `user.${Date.now()}@example.com`;
      }
      
      onAuthenticated(mockEmail);
      toast({
        title: "Welcome!",
        description: `Successfully signed in with ${provider}`,
      });
      setSocialLoading(null);
    }, 1500);
  };

  if (isAuthenticated) {
    return (
      <div className={`${isMobile ? 'px-4 py-6' : 'p-8'} space-y-4`}>
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center gap-3 justify-center text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-300 text-lg">
                  Ready to Continue
                </h4>
                <p className="text-green-600 dark:text-green-400 text-sm truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'px-4 py-6 space-y-6' : 'p-8 space-y-8'}`}>
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Sign In to Continue
        </h2>
        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-base leading-relaxed' : 'text-lg'}`}>
          {isMobile ? 'Quick and secure access to book your consultation' : 'Sign in or create an account to continue with your booking'}
        </p>
      </div>

      {/* Social Sign-On Section */}
      <div className="space-y-4">
        <div className="text-center">
          <p className={`text-gray-500 dark:text-gray-400 font-medium ${isMobile ? 'text-sm mb-4' : 'text-base mb-6'}`}>
            Continue with your account
          </p>
        </div>
        
        <div className="grid gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialSignIn('Google')}
            disabled={!!socialLoading}
            className={`w-full border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium min-w-0 flex-1 text-left">
                {socialLoading === 'Google' ? 'Connecting...' : 'Continue with Google'}
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSocialSignIn('Apple')}
            disabled={!!socialLoading}
            className={`w-full border-2 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
          >
            <div className="flex items-center gap-3">
              <Apple className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
              <span className="font-medium min-w-0 flex-1 text-left">
                {socialLoading === 'Apple' ? 'Connecting...' : 'Continue with Apple'}
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSocialSignIn('Microsoft')}
            disabled={!!socialLoading}
            className={`w-full border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
                <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z"/>
                <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z"/>
                <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
              </svg>
              <span className="font-medium min-w-0 flex-1 text-left">
                {socialLoading === 'Microsoft' ? 'Connecting...' : 'Continue with Outlook'}
              </span>
            </div>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-3 py-1 text-gray-500 dark:text-gray-400 rounded-full border">
              Or use email
            </span>
          </div>
        </div>
      </div>

      {/* Email Sign-In/Up Tabs */}
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className={`grid w-full grid-cols-2 mb-6 ${isMobile ? 'h-12' : 'h-14'}`}>
          <TabsTrigger value="signin" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
            Create Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-gray-700 dark:text-gray-200 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 border-2 focus:border-medical-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password" className="text-gray-700 dark:text-gray-200 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 border-2 focus:border-medical-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className={`w-full bg-medical-primary hover:bg-medical-primary/90 text-white font-semibold transition-all duration-200 ${isMobile ? 'h-12 text-base mt-6' : 'h-14 text-lg mt-8'}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="signup-firstname" className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-firstname"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`pl-9 border-2 focus:border-medical-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isMobile ? 'h-11 text-sm' : 'h-12 text-base'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-lastname" className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                  Last Name
                </Label>
                <Input
                  id="signup-lastname"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`border-2 focus:border-medical-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isMobile ? 'h-11 text-sm' : 'h-12 text-base'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-700 dark:text-gray-200 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 border-2 focus:border-medical-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-200 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 border-2 focus:border-medical-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              className={`w-full bg-medical-primary hover:bg-medical-primary/90 text-white font-semibold transition-all duration-200 ${isMobile ? 'h-12 text-base mt-6' : 'h-14 text-lg mt-8'}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleSignOn;
