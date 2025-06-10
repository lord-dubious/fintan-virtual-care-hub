import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for auth pages
const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Remember me</span>
            </label>
            <a href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <button 
            type="submit" 
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <a href="/auth/register" className="text-primary hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Register = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded-md" 
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded-md" 
              placeholder="Confirm your password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Type</label>
            <select className="w-full p-2 border rounded-md">
              <option value="PATIENT">Patient</option>
              <option value="PROVIDER">Healthcare Provider</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" required />
            <span className="text-sm">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </div>
          <button 
            type="submit" 
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-primary hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>
        <p className="text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your email"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Send Reset Link
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Remember your password?{' '}
            <a href="/auth/login" className="text-primary hover:underline">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ResetPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Create New Password</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded-md" 
              placeholder="Confirm new password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  </div>
);

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;

