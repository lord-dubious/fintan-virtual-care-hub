import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for auth pages
const Login = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Login</h1>
    <p>Login form will be implemented here.</p>
  </div>
);

const Register = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Register</h1>
    <p>Registration form will be implemented here.</p>
  </div>
);

const ForgotPassword = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
    <p>Password recovery form will be implemented here.</p>
  </div>
);

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Auth;

