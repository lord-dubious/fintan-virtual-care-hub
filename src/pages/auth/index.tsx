
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './login';
import RegisterPage from './register';
import ResetPasswordPage from './reset-password';

const Auth: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default Auth;
