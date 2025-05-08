
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Headphones, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-medical-bg-light to-medical-border-light py-16 md:py-24">
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
