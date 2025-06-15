import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">Welcome, {user?.name || 'User'}!</p>
      <p className="mb-4">Role: {user?.role || 'Unknown'}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Upcoming Appointments</h2>
          <p className="text-gray-600 dark:text-gray-300">No upcoming appointments.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Recent Consultations</h2>
          <p className="text-gray-600 dark:text-gray-300">No recent consultations.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Health Records</h2>
          <p className="text-gray-600 dark:text-gray-300">No health records available.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

