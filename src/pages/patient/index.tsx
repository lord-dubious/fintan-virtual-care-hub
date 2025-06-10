import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for patient pages
const PatientProfile = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">My Profile</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" className="w-full p-2 border rounded-md" defaultValue="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input type="date" className="w-full p-2 border rounded-md" defaultValue="1990-01-01" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded-md" defaultValue="john.doe@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" className="w-full p-2 border rounded-md" defaultValue="(123) 456-7890" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 mt-6">Medical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Blood Type</label>
            <select className="w-full p-2 border rounded-md">
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Allergies</label>
            <input type="text" className="w-full p-2 border rounded-md" placeholder="List any allergies" />
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

const MedicalRecords = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Records</h2>
        <p className="text-gray-600 dark:text-gray-300">No medical records found.</p>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload New Record</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Record Type</label>
            <select className="w-full p-2 border rounded-md">
              <option>Lab Result</option>
              <option>Imaging</option>
              <option>Prescription</option>
              <option>Doctor's Note</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input type="file" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="w-full p-2 border rounded-md" rows={3}></textarea>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Upload Record
          </button>
        </form>
      </div>
    </div>
  </div>
);

const PatientRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<PatientProfile />} />
      <Route path="records" element={<MedicalRecords />} />
      <Route path="*" element={<Navigate to="/patient/profile" replace />} />
    </Routes>
  );
};

export default PatientRoutes;

