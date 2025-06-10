import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Virtual Healthcare for You
              </h1>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                Connect with licensed healthcare providers from the comfort of your home.
                Get the care you need, when you need it.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/auth/register" 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Get Started
                </Link>
                <Link 
                  to="/auth/login" 
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Hero Image Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🩺</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Virtual Consultations</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with healthcare providers through secure video calls for diagnosis and treatment.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Medical Records</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access and manage your medical records securely from anywhere, anytime.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Prescription Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get prescriptions and manage medications through our secure platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Account</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sign up and complete your profile with basic information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Appointment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose a provider and schedule a convenient time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Virtual Visit</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with your provider through our secure platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3">Follow-up Care</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive treatment plans and schedule follow-up appointments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of patients who have already experienced the convenience of virtual healthcare.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/auth/register" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Create Account
            </Link>
            <Link 
              to="/auth/login" 
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

