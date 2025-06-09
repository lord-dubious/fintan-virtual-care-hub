import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for appointment pages
const AppointmentList = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Book New Appointment
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-300">No upcoming appointments found.</p>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
      <p className="text-gray-600 dark:text-gray-300">No past appointments found.</p>
    </div>
  </div>
);

const BookAppointment = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Appointment Type</label>
          <select className="w-full p-2 border rounded-md">
            <option>General Consultation</option>
            <option>Follow-up</option>
            <option>Specialist Consultation</option>
            <option>Urgent Care</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select className="w-full p-2 border rounded-md">
            <option>Dr. Jane Smith - Cardiology</option>
            <option>Dr. John Doe - General Medicine</option>
            <option>Dr. Emily Johnson - Pediatrics</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" className="w-full p-2 border rounded-md" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Available Time Slots</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM'].map((time) => (
              <button 
                key={time}
                type="button" 
                className="p-2 border rounded-md hover:bg-primary/10"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Reason for Visit</label>
          <textarea className="w-full p-2 border rounded-md" rows={3}></textarea>
        </div>
        
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Confirm Appointment
        </button>
      </form>
    </div>
  </div>
);

const AppointmentDetail = () => (
  <div className="container mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Appointment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider</p>
            <p>Dr. Jane Smith - Cardiology</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</p>
            <p>June 15, 2023 - 10:00 AM</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
            <p>General Consultation</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-green-600">Confirmed</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Reason for Visit</h2>
        <p>Regular check-up and follow-up on previous medication.</p>
      </div>
      
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Join Consultation
        </button>
        <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
          Cancel Appointment
        </button>
      </div>
    </div>
  </div>
);

const AppointmentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppointmentList />} />
      <Route path="book" element={<BookAppointment />} />
      <Route path=":id" element={<AppointmentDetail />} />
      <Route path="*" element={<Navigate to="/appointments" replace />} />
    </Routes>
  );
};

export default AppointmentRoutes;

