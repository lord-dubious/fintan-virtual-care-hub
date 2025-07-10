import React from "react";
// Example component demonstrating the new validation system
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useValidation, validationUtils } from '@/hooks/useValidation';
import { LoginSchema, RegisterSchema } from '@/lib/validation/schemas';
import { Role, AppointmentStatus, PaymentStatus } from '@/lib/types/enums';

const ValidationExample: React.FC = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT' as const,
  });

  // Login validation
  const loginValidation = useValidation({
    schema: LoginSchema,
    onSuccess: (data) => {
      console.log('Login data validated:', data);
    },
    showToast: false, // Disable toast for demo
  });

  // Register validation
  const registerValidation = useValidation({
    schema: RegisterSchema,
    onSuccess: (data) => {
      console.log('Register data validated:', data);
    },
    showToast: false, // Disable toast for demo
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginValidation.validate(loginData);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerValidation.validate(registerData);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Type Safety & Validation Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating unified enums, Zod validation, and type safety improvements
        </p>
      </div>

      {/* Enum Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Unified Enum System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">User Roles:</Label>
            <div className="flex gap-2 mt-1">
              {Object.values(Role).map((role) => (
                <Badge key={role} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Appointment Statuses:</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {Object.values(AppointmentStatus).map((status) => (
                <Badge key={status} variant="outline">
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Payment Statuses:</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {Object.values(PaymentStatus).map((status) => (
                <Badge key={status} variant="outline">
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Login Form with Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Login Validation
              {loginValidation.errors.length === 0 && loginData.email && loginData.password ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => {
                    setLoginData(prev => ({ ...prev, email: e.target.value }));
                    loginValidation.clearFieldError('email');
                  }}
                  className={validationUtils.hasFieldError(loginValidation.errors, 'email') ? 'border-red-500' : ''}
                />
                {validationUtils.getFieldError(loginValidation.errors, 'email') && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationUtils.getFieldError(loginValidation.errors, 'email')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData(prev => ({ ...prev, password: e.target.value }));
                    loginValidation.clearFieldError('password');
                  }}
                  className={validationUtils.hasFieldError(loginValidation.errors, 'password') ? 'border-red-500' : ''}
                />
                {validationUtils.getFieldError(loginValidation.errors, 'password') && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationUtils.getFieldError(loginValidation.errors, 'password')}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loginValidation.isValidating}
                className="w-full"
              >
                {loginValidation.isValidating ? 'Validating...' : 'Validate Login'}
              </Button>
            </form>

            {loginValidation.errors.length > 0 && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>
                  {loginValidation.errors.length} validation error(s) found
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Register Form with Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Register Validation
              {registerValidation.errors.length === 0 && registerData.email && registerData.password ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <Label htmlFor="register-name">Name</Label>
                <Input
                  id="register-name"
                  value={registerData.name}
                  onChange={(e) => {
                    setRegisterData(prev => ({ ...prev, name: e.target.value }));
                    registerValidation.clearFieldError('name');
                  }}
                  className={validationUtils.hasFieldError(registerValidation.errors, 'name') ? 'border-red-500' : ''}
                />
                {validationUtils.getFieldError(registerValidation.errors, 'name') && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationUtils.getFieldError(registerValidation.errors, 'name')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => {
                    setRegisterData(prev => ({ ...prev, email: e.target.value }));
                    registerValidation.clearFieldError('email');
                  }}
                  className={validationUtils.hasFieldError(registerValidation.errors, 'email') ? 'border-red-500' : ''}
                />
                {validationUtils.getFieldError(registerValidation.errors, 'email') && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationUtils.getFieldError(registerValidation.errors, 'email')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData(prev => ({ ...prev, password: e.target.value }));
                    registerValidation.clearFieldError('password');
                  }}
                  className={validationUtils.hasFieldError(registerValidation.errors, 'password') ? 'border-red-500' : ''}
                />
                {validationUtils.getFieldError(registerValidation.errors, 'password') && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationUtils.getFieldError(registerValidation.errors, 'password')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-confirm">Confirm Password</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => {
                    setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    registerValidation.clearFieldError('confirmPassword');
                  }}
                  className={validationUtils.hasFieldError(registerValidation.errors, 'confirmPassword') ? 'border-red-500' : ''}
                />
                {validationUtils.getFieldError(registerValidation.errors, 'confirmPassword') && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationUtils.getFieldError(registerValidation.errors, 'confirmPassword')}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={registerValidation.isValidating}
                className="w-full"
              >
                {registerValidation.isValidating ? 'Validating...' : 'Validate Registration'}
              </Button>
            </form>

            {registerValidation.errors.length > 0 && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>
                  {registerValidation.errors.length} validation error(s) found
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">✅ Type Safety</h4>
              <p className="text-sm text-muted-foreground">
                Unified enums ensure consistency between frontend and backend
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🛡️ Zod Validation</h4>
              <p className="text-sm text-muted-foreground">
                Runtime validation with comprehensive error messages
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Real-time Feedback</h4>
              <p className="text-sm text-muted-foreground">
                Immediate validation feedback as users type
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationExample;
