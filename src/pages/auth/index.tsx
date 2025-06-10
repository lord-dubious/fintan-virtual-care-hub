
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import Register from './register';
import ResetPassword from './reset-password';

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default Auth;
