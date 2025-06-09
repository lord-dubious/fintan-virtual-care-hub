import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for admin pages
const AdminDashboard = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-3">Users</h2>
        <div className="text-3xl font-bold">0</div>
        <p className="text-gray-600 dark:text-gray-300">Total registered users</p>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-3">Providers</h2>
        <div className="text-3xl font-bold">0</div>
        <p className="text-gray-600 dark:text-gray-300">Active healthcare providers</p>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-3">Appointments</h2>
        <div className="text-3xl font-bold">0</div>
        <p className="text-gray-600 dark:text-gray-300">Scheduled appointments</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-600 dark:text-gray-300">No recent activity.</p>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Database</span>
            <span className="text-green-500">Online</span>
          </div>
          <div className="flex justify-between">
            <span>Video Service</span>
            <span className="text-green-500">Online</span>
          </div>
          <div className="flex justify-between">
            <span>Notification Service</span>
            <span className="text-green-500">Online</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserManagement = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">User Management</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="p-2 border rounded-md"
          />
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Add User
          </button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300">No users found.</p>
    </div>
  </div>
);

const ProviderManagement = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Provider Management</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Healthcare Providers</h2>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search providers..." 
            className="p-2 border rounded-md"
          />
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Add Provider
          </button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300">No providers found.</p>
    </div>
  </div>
);

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="providers" element={<ProviderManagement />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;

