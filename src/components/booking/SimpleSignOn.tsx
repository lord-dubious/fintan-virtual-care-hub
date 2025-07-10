import React from "react";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

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
  const { login, register, isLoggingIn, isRegistering, isAuthenticated: globalIsAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Check if user is already authenticated globally
  useEffect(() => {
    if (globalIsAuthenticated && user && !isAuthenticated) {
      onAuthenticated(user.email);
    }
  }, [globalIsAuthenticated, user, isAuthenticated, onAuthenticated]);

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

    try {
      await login({ email: formData.email, password: formData.password });
      onAuthenticated(formData.email);
      toast({
        title: "Welcome!",
        description: "You've been signed in successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        variant: "destructive"
      });
    }
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

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await register({
        name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password,
        role: 'PATIENT',
      });

      onAuthenticated(formData.email);
      toast({
        title: "Account Created!",
        description: "Welcome to Dr. Fintan's practice",
      });
    } catch (error: unknown) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive"
      });
    }
  };



  // Show authenticated state if user is logged in globally or locally
  if (isAuthenticated || globalIsAuthenticated) {
    const displayEmail = userEmail || user?.email || '';
    const displayName = user?.name || '';

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
              {displayName && (
                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                  Welcome, {displayName}
                </p>
              )}
              <p className="text-green-600 dark:text-green-400 text-sm">
                {displayEmail}
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

      {/* Email/Password Authentication */}
      <div className="space-y-3">


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
                disabled={isLoggingIn}
                className={`w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
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
                disabled={isRegistering}
                className={`w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
              >
                {isRegistering ? "Creating account..." : "Create Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleSignOn;
