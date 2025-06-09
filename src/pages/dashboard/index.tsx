import React from 'react';
import { useAuth } from '@/lib/auth/authProvider';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Welcome, {user?.name || 'User'}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This is your personal dashboard where you can manage your healthcare needs.
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Upcoming Appointments</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You have no upcoming appointments.
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Schedule Now
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-3">Recent Consultations</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You have no recent consultations.
          </p>
        </div>
      </div>
      
      {user?.role === 'PATIENT' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Medical Records</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access your medical history and test results.
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                View Records
              </button>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Prescriptions</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                View and manage your prescriptions.
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                View Prescriptions
              </button>
            </div>
          </div>
        </div>
      )}
      
      {user?.role === 'PROVIDER' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Provider Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Today's Schedule</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                View and manage your appointments for today.
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                View Schedule
              </button>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Patient Records</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access patient medical records and history.
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                Search Patients
              </button>
            </div>
          </div>
        </div>
      )}
      
      {user?.role === 'ADMIN' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">User Management</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Manage patients and providers in the system.
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                Manage Users
              </button>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">System Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                View system usage and performance metrics.
              </p>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

