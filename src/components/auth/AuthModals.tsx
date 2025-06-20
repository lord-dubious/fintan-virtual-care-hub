import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Apple, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  onLoginClose: () => void;
  onSignupClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
  onSignupSuccess?: (email: string, name: string) => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isLoginOpen,
  isSignupOpen,
  onLoginClose,
  onSignupClose,
  onSwitchToSignup,
  onSwitchToLogin,
  onSignupSuccess
}) => {
  const { toast } = useToast();
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    
    // Simulate social authentication
    setTimeout(() => {
      toast({
        title: "Welcome!",
        description: `Signed in with ${provider}`,
      });
      setSocialLoading(null);
      onLoginClose();
      onSignupClose();
    }, 1500);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    try {
      await login({ email: loginData.email, password: loginData.password });
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully",
      });
      onLoginClose();
      setLoginData({ email: '', password: '' });
    } catch (error: unknown) {
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        variant: "destructive"
      });
    }
  };

  const handleSignup = async () => {
    if (!signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const fullName = `${signupData.firstName} ${signupData.lastName}`.trim();
      await register({
        name: fullName,
        email: signupData.email,
        password: signupData.password,
        role: 'PATIENT',
      });

      toast({
        title: "Account Created!",
        description: "Welcome to Dr. Fintan's practice",
      });
      onSignupClose();
      setSignupData({ firstName: '', lastName: '', email: '', password: '' });

      // Trigger patient onboarding
      if (onSignupSuccess) {
        onSignupSuccess(signupData.email, fullName);
      }
    } catch (error: unknown) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive"
      });
    }
  };

  const SocialButtons = () => (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={() => handleSocialSignIn('Google')}
        disabled={!!socialLoading}
        className="w-full border-medical-border-light dark:border-medical-dark-border hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 h-11"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium">
            {socialLoading === 'Google' ? 'Connecting...' : 'Continue with Google'}
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSocialSignIn('Apple')}
        disabled={!!socialLoading}
        className="w-full border-medical-border-light dark:border-medical-dark-border hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 h-11"
      >
        <div className="flex items-center gap-3">
          <Apple className="w-5 h-5 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
          <span className="font-medium">
            {socialLoading === 'Apple' ? 'Connecting...' : 'Continue with Apple'}
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSocialSignIn('Microsoft')}
        disabled={!!socialLoading}
        className="w-full border-medical-border-light dark:border-medical-dark-border hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 h-11"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
            <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z"/>
            <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z"/>
            <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
          </svg>
          <span className="font-medium">
            {socialLoading === 'Microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
          </span>
        </div>
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-medical-border-light dark:border-medical-dark-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-medical-dark-surface px-2 text-medical-neutral-500 dark:text-medical-dark-text-secondary">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-medical-primary dark:text-medical-accent">
              Welcome Back
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <SocialButtons />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-medical-neutral-400 dark:text-medical-dark-text-secondary" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-11 border-medical-border-light dark:border-medical-dark-border dark:bg-medical-dark-surface/50 dark:text-medical-dark-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-medical-neutral-400 dark:text-medical-dark-text-secondary" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 h-11 border-medical-border-light dark:border-medical-dark-border dark:bg-medical-dark-surface/50 dark:text-medical-dark-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-medical-neutral-400 dark:text-medical-dark-text-secondary hover:text-medical-neutral-600 dark:hover:text-medical-dark-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full h-11 bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 font-medium"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    onLoginClose();
                    onSwitchToSignup();
                  }}
                  className="text-medical-primary dark:text-medical-accent hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={isSignupOpen} onOpenChange={onSignupClose}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-medical-primary dark:text-medical-accent">
              Create Account
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <SocialButtons />

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="signup-firstname" className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-medical-neutral-400 dark:text-medical-dark-text-secondary" />
                    <Input
                      id="signup-firstname"
                      placeholder="John"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="pl-10 h-11 border-medical-border-light dark:border-medical-dark-border dark:bg-medical-dark-surface/50 dark:text-medical-dark-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-lastname" className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                    Last Name
                  </Label>
                  <Input
                    id="signup-lastname"
                    placeholder="Doe"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-11 border-medical-border-light dark:border-medical-dark-border dark:bg-medical-dark-surface/50 dark:text-medical-dark-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email" className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-medical-neutral-400 dark:text-medical-dark-text-secondary" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-11 border-medical-border-light dark:border-medical-dark-border dark:bg-medical-dark-surface/50 dark:text-medical-dark-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password" className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-medical-neutral-400 dark:text-medical-dark-text-secondary" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 h-11 border-medical-border-light dark:border-medical-dark-border dark:bg-medical-dark-surface/50 dark:text-medical-dark-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-medical-neutral-400 dark:text-medical-dark-text-secondary hover:text-medical-neutral-600 dark:hover:text-medical-dark-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleSignup}
                disabled={isRegistering}
                className="w-full h-11 bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 font-medium"
              >
                {isRegistering ? "Creating account..." : "Create Account"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    onSignupClose();
                    onSwitchToLogin();
                  }}
                  className="text-medical-primary dark:text-medical-accent hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
