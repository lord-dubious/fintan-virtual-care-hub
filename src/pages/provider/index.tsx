import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for provider pages
const ProviderProfile = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Provider Profile</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" className="w-full p-2 border rounded-md" defaultValue="Dr. Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <input type="text" className="w-full p-2 border rounded-md" defaultValue="Cardiology" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">License Number</label>
            <input type="text" className="w-full p-2 border rounded-md" defaultValue="MD12345" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Years of Experience</label>
            <input type="number" className="w-full p-2 border rounded-md" defaultValue="15" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 mt-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded-md" defaultValue="dr.smith@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" className="w-full p-2 border rounded-md" defaultValue="(123) 456-7890" />
          </div>
        </div>
        
        <div className="mt-6">
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
);

const ProviderSchedule = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">My Schedule</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Availability Settings</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked={day !== 'Saturday' && day !== 'Sunday'} />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Working Hours</label>
            <div className="flex items-center space-x-2">
              <select className="p-2 border rounded-md">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
              <span>to</span>
              <select className="p-2 border rounded-md">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} selected={i === 17}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Appointment Duration (minutes)</label>
          <select className="w-full p-2 border rounded-md">
            <option>15</option>
            <option selected>30</option>
            <option>45</option>
            <option>60</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Save Availability
        </button>
      </form>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
      <p className="text-gray-600 dark:text-gray-300">No upcoming appointments found.</p>
    </div>
  </div>
);

const PatientList = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">My Patients</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patient List</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="pl-8 p-2 border rounded-md"
          />
          <span className="absolute left-2 top-2">🔍</span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300">No patients found.</p>
    </div>
  </div>
);

const ProviderRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<ProviderProfile />} />
      <Route path="schedule" element={<ProviderSchedule />} />
      <Route path="patients" element={<PatientList />} />
      <Route path="*" element={<Navigate to="/provider/profile" replace />} />
    </Routes>
  );
};

export default ProviderRoutes;

