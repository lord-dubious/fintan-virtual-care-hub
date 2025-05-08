
import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const ContactPage = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the form data to a server
    toast({
      title: "Message sent",
      description: "Thank you for your message. We'll get back to you shortly.",
    });
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
            Contact Us
          </h1>
          <p className="text-center text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-10 max-w-xl mx-auto">
            Have questions about Dr. Fintan's services? Reach out to us and we'll get back to you as soon as possible.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Information */}
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-medical-primary/10 dark:bg-medical-accent/20 rounded-full flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-medical-dark-text-primary">Email</h3>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">support@drfintan.com</p>
                    <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      For general inquiries and support
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-medical-primary/10 dark:bg-medical-accent/20 rounded-full flex items-center justify-center mr-4">
                    <Phone className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-medical-dark-text-primary">Phone</h3>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">(555) 123-4567</p>
                    <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Monday to Friday, 9am - 5pm
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-medical-primary/10 dark:bg-medical-accent/20 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-medical-dark-text-primary">Address</h3>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      1234 Medical Center Drive<br />
                      Suite 500<br />
                      San Francisco, CA 94158
                    </p>
                    <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Administrative office only (no in-person visits)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-medical-primary/10 dark:bg-medical-accent/20 rounded-full flex items-center justify-center mr-4">
                    <Clock className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-medical-dark-text-primary">Hours</h3>
                    <div className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      <p>Monday - Friday: 8am - 8pm</p>
                      <p>Saturday: 9am - 1pm</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="dark:text-medical-dark-text-primary">Name</Label>
                  <Input id="name" placeholder="Your full name" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="email" className="dark:text-medical-dark-text-primary">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="dark:text-medical-dark-text-primary">Subject</Label>
                  <Input id="subject" placeholder="What is this regarding?" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="message" className="dark:text-medical-dark-text-primary">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Your message or question"
                    className="mt-1"
                    rows={5}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
          
          {/* Emergency Notice */}
          <div className="mt-12 max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-800 dark:text-red-300">
            <h3 className="font-bold mb-2">Medical Emergency?</h3>
            <p>
              Our virtual consultation service is not intended for medical emergencies. If you are experiencing a medical emergency, please call emergency services (911) or go to your nearest emergency room immediately.
            </p>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default ContactPage;
