import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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
  const navigate = useNavigate();
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
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
      // Toast notification is handled by useAuth hook
      onLoginClose();
      setLoginData({ email: '', password: '' });

      // Redirect to appropriate dashboard based on user role
      setTimeout(() => {
        if (user?.role === 'PATIENT') {
          navigate('/dashboard');
        } else if (user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user?.role === 'DOCTOR') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/dashboard'); // Default to patient dashboard
        }
      }, 1000); // Small delay to allow auth state to update
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

      // Toast notification is handled by useAuth hook
      onSignupClose();
      setSignupData({ firstName: '', lastName: '', email: '', password: '' });

      // Trigger patient onboarding
      if (onSignupSuccess) {
        onSignupSuccess(signupData.email, fullName);
      }
    } catch (error: unknown) {
      // Error toast is handled by useAuth hook
      console.error('Registration error:', error);
    }
  };



  return (
    <>
      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-medical-primary dark:text-medical-accent">
              Welcome Back
            </DialogTitle>
            <DialogDescription className="text-center text-medical-neutral-600 dark:text-medical-dark-text-secondary">
              Sign in to your account to continue
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Email Login Only */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-medical-neutral-700 dark:text-medical-dark-text-primary">
                Sign in with your email
              </h3>
              <p className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-1">
                Enter your credentials to access your account
              </p>
            </div>
            
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
            <DialogDescription className="text-center text-medical-neutral-600 dark:text-medical-dark-text-secondary">
              Join Dr. Fintan's practice to get started
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            {/* Email Registration Only */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-medical-neutral-700 dark:text-medical-dark-text-primary">
                Create your account
              </h3>
              <p className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-1">
                Enter your details to get started
              </p>
            </div>

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
