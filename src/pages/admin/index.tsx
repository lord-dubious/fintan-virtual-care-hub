import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for admin pages
const AdminDashboard = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <p>Admin dashboard will be implemented here.</p>
  </div>
);

const UserManagement = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">User Management</h1>
    <p>User management interface will be implemented here.</p>
  </div>
);

const SystemSettings = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">System Settings</h1>
    <p>System settings interface will be implemented here.</p>
  </div>
);

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="settings" element={<SystemSettings />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
