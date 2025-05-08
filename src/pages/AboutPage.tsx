
import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
              About Dr. Fintan
            </h1>
            
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-10">
              {/* Doctor's profile */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                <div className="w-40 h-40 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center overflow-hidden">
                  {/* Placeholder for doctor's image */}
                  <div className="text-5xl font-bold text-medical-primary dark:text-medical-accent">F</div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-semibold mb-2 dark:text-medical-dark-text-primary">Dr. Fintan Smith, MD</h2>
                  <p className="text-medical-primary dark:text-medical-accent font-medium mb-3">General Practitioner & Telemedicine Specialist</p>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
                    With over 15 years of clinical experience, Dr. Fintan Smith is passionate about making quality healthcare accessible through telemedicine. 
                    He specializes in general practice, preventive medicine, and chronic disease management.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">General Practice</span>
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Telemedicine</span>
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Preventive Care</span>
                  </div>
                </div>
              </div>
              
              {/* Education & Credentials */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Education & Credentials</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-medical-dark-text-primary">Doctor of Medicine (MD)</p>
                      <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">University of California Medical School, 2008</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-medical-dark-text-primary">Residency in Family Medicine</p>
                      <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">Stanford Medical Center, 2008-2011</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-medical-dark-text-primary">Board Certified in Family Medicine</p>
                      <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">American Board of Family Medicine</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-medical-dark-text-primary">Telemedicine Certification</p>
                      <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">American Telemedicine Association, 2015</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Philosophy of Care */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Philosophy of Care</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-md border-l-4 border-medical-primary dark:border-medical-accent">
                  <p className="italic text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    "I believe healthcare should be accessible to everyone, regardless of location or schedule constraints. My approach focuses on understanding the whole person, not just treating symptoms. Through telemedicine, I aim to provide compassionate, convenient, and comprehensive care that empowers patients to take an active role in their health journey."
                  </p>
                  <p className="mt-3 font-medium dark:text-medical-dark-text-primary">— Dr. Fintan Smith</p>
                </div>
              </div>
              
              {/* Professional Experience */}
              <div>
                <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Professional Experience</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium dark:text-medical-dark-text-primary">Virtual Care Specialist</p>
                    <p className="text-medical-primary dark:text-medical-accent">2018 - Present</p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Leading virtual consultations and telehealth services, making quality healthcare accessible to patients regardless of location.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium dark:text-medical-dark-text-primary">Family Physician</p>
                    <p className="text-medical-primary dark:text-medical-accent">2011 - 2018</p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Provided comprehensive care to patients of all ages, focusing on preventive medicine and chronic disease management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Ready to Schedule a Consultation?</h3>
              <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-6">
                Experience personalized healthcare from the comfort of your home.
              </p>
              <Link to="/booking">
                <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default AboutPage;
