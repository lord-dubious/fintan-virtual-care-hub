import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Headphones, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();

  // Mobile app-like hero design
  if (isMobile) {
    return (
      <section className="py-4">
        <div className="px-4 mb-6">
          <span className="bg-medical-accent/10 dark:bg-medical-accent/20 text-medical-accent dark:text-medical-accent px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
            Virtual Healthcare
          </span>
          <h1 className="text-2xl font-bold mb-3 text-medical-neutral-600 dark:text-medical-dark-text-primary leading-tight">
            Virtual Consultations with <span className="text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
          </h1>
          <p className="text-base text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-4">
            Professional healthcare from the comfort of your home. Secure and personalized care.
          </p>
          
          <div className="flex flex-col gap-3 mb-5">
            <Link to="/booking" className="w-full">
              <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 dark:bg-medical-accent dark:hover:bg-medical-accent/90 text-white py-6">
                Book a Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/services" className="w-full">
              <Button variant="outline" className="w-full border-medical-primary text-medical-primary hover:bg-medical-primary/10 dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent/10 py-2">
                View Services
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="px-4 mb-5">
          <div className="rounded-xl overflow-hidden shadow-md bg-white dark:bg-medical-dark-surface border border-medical-border-light dark:border-medical-dark-border">
            <img
              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Doctor on video call with patient"
              className="w-full h-auto aspect-video object-cover"
            />
          </div>
        </div>
        
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm border border-medical-border-light dark:border-medical-dark-border">
              <div className="h-10 w-10 rounded-full bg-medical-secondary/10 dark:bg-medical-secondary/20 flex items-center justify-center mr-3">
                <Video className="text-medical-secondary h-5 w-5" />
              </div>
              <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Video Consultations</span>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm border border-medical-border-light dark:border-medical-dark-border">
              <div className="h-10 w-10 rounded-full bg-medical-secondary/10 dark:bg-medical-secondary/20 flex items-center justify-center mr-3">
                <Headphones className="text-medical-secondary h-5 w-5" />
              </div>
              <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Audio Sessions</span>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm border border-medical-border-light dark:border-medical-dark-border">
              <div className="h-10 w-10 rounded-full bg-medical-secondary/10 dark:bg-medical-secondary/20 flex items-center justify-center mr-3">
                <Calendar className="text-medical-secondary h-5 w-5" />
              </div>
              <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Easy Scheduling</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Desktop view remains the same
  return (
    <section className="bg-gradient-to-br from-medical-bg-light to-medical-border-light dark:from-medical-dark-bg dark:to-medical-dark-surface py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <span className="bg-medical-accent/10 text-medical-accent px-4 py-1 rounded-full text-sm font-medium inline-block mb-4">
              Virtual Healthcare
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-medical-neutral-600 leading-tight">
              Accessible Virtual Consultations with <span className="text-medical-primary">Dr. Fintan</span>
            </h1>
            <p className="text-lg text-medical-neutral-500 mb-8 max-w-lg">
              Professional healthcare from the comfort of your home. Secure video or audio consultations with personalized care and expert medical advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white">
                Book a Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10">
                Learn More
              </Button>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-medical-secondary/10 flex items-center justify-center mr-2">
                  <Video className="text-medical-secondary h-5 w-5" />
                </div>
                <span className="text-medical-neutral-600 font-medium">Video Consultations</span>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-medical-secondary/10 flex items-center justify-center mr-2">
                  <Headphones className="text-medical-secondary h-5 w-5" />
                </div>
                <span className="text-medical-neutral-600 font-medium">Audio Sessions</span>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-medical-secondary/10 flex items-center justify-center mr-2">
                  <Calendar className="text-medical-secondary h-5 w-5" />
                </div>
                <span className="text-medical-neutral-600 font-medium">Easy Scheduling</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 lg:pl-10">
            <div className="rounded-2xl overflow-hidden shadow-xl bg-white p-3">
              <img
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Doctor on video call with patient"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
