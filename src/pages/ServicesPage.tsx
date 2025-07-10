import React from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
            Our Services
          </h1>
          <p className="text-lg text-center text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-10 max-w-3xl mx-auto">
            Dr. Fintan offers comprehensive virtual healthcare consultations tailored to your needs. Choose the option that works best for you.
          </p>
          
          {/* Service Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Video Consultation */}
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mr-4">
                  <Video className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
                </div>
                <h2 className="text-2xl font-semibold dark:text-medical-dark-text-primary">Video Consultation</h2>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-medical-neutral-600 dark:text-medical-dark-text-secondary mr-2" />
                  <span className="dark:text-medical-dark-text-secondary">30 minutes</span>
                </div>
                <div className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">$85.00</div>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
                  Face-to-face virtual consultation with Dr. Fintan via secure video connection. Ideal for detailed discussions and visual assessments.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 dark:text-medical-dark-text-primary">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Secure, HIPAA-compliant video platform</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Visual assessment of physical symptoms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Digital prescriptions (where applicable)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Follow-up recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Consultation summary via email</span>
                  </li>
                </ul>
              </div>
              
              <Link to="/booking">
                <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                  Book Video Consultation
                </Button>
              </Link>
            </div>
            
            {/* Audio Consultation */}
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mr-4">
                  <Phone className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
                </div>
                <h2 className="text-2xl font-semibold dark:text-medical-dark-text-primary">Audio Consultation</h2>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-medical-neutral-600 dark:text-medical-dark-text-secondary mr-2" />
                  <span className="dark:text-medical-dark-text-secondary">30 minutes</span>
                </div>
                <div className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">$65.00</div>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
                  Voice-only consultation with Dr. Fintan. Perfect for follow-ups, discussing test results, or conditions that don't require visual assessment.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 dark:text-medical-dark-text-primary">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">High-quality audio connection</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Lower bandwidth requirements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Digital prescriptions (where applicable)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Follow-up recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">Consultation summary via email</span>
                  </li>
                </ul>
              </div>
              
              <Link to="/booking">
                <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                  Book Audio Consultation
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Common Conditions Section */}
          <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center dark:text-medical-dark-text-primary">
              Common Conditions Treated
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 dark:text-medical-dark-text-primary">Cold & Flu</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Assessment and treatment for common cold and flu symptoms.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 dark:text-medical-dark-text-primary">Allergies</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Management of seasonal or chronic allergies.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 dark:text-medical-dark-text-primary">Skin Conditions</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Evaluation of rashes, acne, eczema, and other skin issues.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 dark:text-medical-dark-text-primary">Digestive Issues</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Consultation for stomach pain, nausea, and other digestive concerns.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 dark:text-medical-dark-text-primary">Mental Health</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Initial assessment for anxiety, depression, and stress management.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2 dark:text-medical-dark-text-primary">Chronic Disease Management</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Ongoing care for conditions like diabetes, hypertension, or asthma.
                </p>
              </div>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-8 dark:text-medical-dark-text-primary">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="h-16 w-16 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-medical-primary dark:text-medical-accent">1</span>
                </div>
                <h3 className="text-lg font-medium mb-2 dark:text-medical-dark-text-primary">Book Your Appointment</h3>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Choose your preferred consultation type and select an available time slot.
                </p>
              </div>
              <div>
                <div className="h-16 w-16 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-medical-primary dark:text-medical-accent">2</span>
                </div>
                <h3 className="text-lg font-medium mb-2 dark:text-medical-dark-text-primary">Receive Confirmation</h3>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Get an email with consultation details and a secure link to join.
                </p>
              </div>
              <div>
                <div className="h-16 w-16 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-medical-primary dark:text-medical-accent">3</span>
                </div>
                <h3 className="text-lg font-medium mb-2 dark:text-medical-dark-text-primary">Attend Your Consultation</h3>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Connect with Dr. Fintan at your scheduled time for personalized care.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-medical-primary/10 dark:bg-medical-accent/20 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 dark:text-medical-dark-text-primary">Ready to Get Started?</h2>
            <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-6 max-w-2xl mx-auto">
              Book your virtual consultation with Dr. Fintan today and take the first step towards convenient, quality healthcare from home.
            </p>
            <Link to="/booking">
              <Button size="lg" className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                Book a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default ServicesPage;
