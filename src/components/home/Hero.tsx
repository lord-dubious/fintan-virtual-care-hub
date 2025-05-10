
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Headphones, Calendar, ShieldCheck } from 'lucide-react';
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
            Connect with <span className="text-medical-primary dark:text-medical-accent">Dr. Fintan</span> Anytime, Anywhere
          </h1>
          <p className="text-base text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-4">
            Quality healthcare that fits your schedule, delivered through secure video and audio consultations.
          </p>
          
          <div className="flex flex-col gap-3 mb-5">
            <Link to="/booking" className="w-full">
              <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 dark:bg-medical-accent dark:hover:bg-medical-accent/90 text-white py-6">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/services" className="w-full">
              <Button variant="outline" className="w-full border-medical-primary text-medical-primary hover:bg-medical-primary/10 dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent/10 py-2">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative px-4 mb-5">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Doctor on video call with patient"
              className="w-full h-auto aspect-video object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center">
                <ShieldCheck className="text-white h-5 w-5 mr-2" />
                <span className="text-white text-sm font-medium">HIPAA-compliant & Secure</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm border border-medical-border-light dark:border-medical-dark-border">
              <div className="h-10 w-10 rounded-full bg-medical-secondary/10 dark:bg-medical-secondary/20 flex items-center justify-center mr-3">
                <Video className="text-medical-secondary h-5 w-5" />
              </div>
              <div>
                <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Video Consultations</span>
                <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">Face-to-face virtual care</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm border border-medical-border-light dark:border-medical-dark-border">
              <div className="h-10 w-10 rounded-full bg-medical-secondary/10 dark:bg-medical-secondary/20 flex items-center justify-center mr-3">
                <Headphones className="text-medical-secondary h-5 w-5" />
              </div>
              <div>
                <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Audio Sessions</span>
                <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">Quick follow-up discussions</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm border border-medical-border-light dark:border-medical-dark-border">
              <div className="h-10 w-10 rounded-full bg-medical-secondary/10 dark:bg-medical-secondary/20 flex items-center justify-center mr-3">
                <Calendar className="text-medical-secondary h-5 w-5" />
              </div>
              <div>
                <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Easy Scheduling</span>
                <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">Book on your terms</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Enhanced desktop view with more focus on solution
  return (
    <section className="bg-gradient-to-br from-medical-bg-light to-medical-border-light dark:from-medical-dark-bg dark:to-medical-dark-surface py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <span className="bg-medical-accent/10 text-medical-accent px-4 py-1 rounded-full text-sm font-medium inline-block mb-4">
              Virtual Healthcare
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-medical-neutral-600 leading-tight dark:text-medical-dark-text-primary">
              Healthcare That <span className="text-medical-primary dark:text-medical-accent">Works</span> Around Your Life
            </h1>
            <p className="text-lg text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-8 max-w-lg">
              Connect with Dr. Fintan for personalized care through secure video consultations — accessible from anywhere, whenever you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/booking">
                <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10 dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent/10">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center mb-3">
                <ShieldCheck className="text-medical-primary dark:text-medical-accent h-5 w-5 mr-2" />
                <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">HIPAA-compliant, secure, and private</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-medical-secondary/10 flex items-center justify-center mr-2">
                    <Video className="text-medical-secondary h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Video Consults</span>
                    <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">Face-to-face care</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-medical-secondary/10 flex items-center justify-center mr-2">
                    <Headphones className="text-medical-secondary h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Audio Sessions</span>
                    <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">Quick follow-ups</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-medical-secondary/10 flex items-center justify-center mr-2">
                    <Calendar className="text-medical-secondary h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">Easy Booking</span>
                    <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">On your schedule</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 lg:pl-10">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Doctor on video call with patient"
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-white text-lg font-medium mr-2">Dr. Fintan</span>
                    <span className="bg-green-500 rounded-full h-2 w-2 animate-pulse"></span>
                  </div>
                  <span className="text-white bg-black/30 px-3 py-1 rounded-full text-xs">Online Now</span>
                </div>
              </div>
              
              {/* Testimonial overlay */}
              <div className="absolute top-4 right-4 bg-white dark:bg-medical-dark-surface rounded-lg p-3 max-w-[180px] shadow-lg">
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-medical-neutral-600 dark:text-medical-dark-text-primary italic">
                  "Dr. Fintan's telehealth service has been life-changing for my chronic condition management."
                </p>
                <p className="text-xs font-semibold mt-1 text-medical-primary dark:text-medical-accent">— Sarah T.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
