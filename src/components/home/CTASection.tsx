
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Clock, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  const features = [{
    icon: ShieldCheck,
    title: "Secure & Private",
    description: "HIPAA-compliant platform with end-to-end encryption for your privacy."
  }, {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book appointments that fit your schedule, including evenings and weekends."
  }, {
    icon: GraduationCap,
    title: "Expert Care",
    description: "Receive care from a board-certified physician with telehealth expertise."
  }];
  
  const testimonials = [
    {
      quote: "Dr. Fintan's telehealth service helped me manage my chronic condition without the stress of frequent clinic visits.",
      author: "Michael R."
    },
    {
      quote: "The virtual consultation was just as effective as an in-person visit, but without the travel and waiting time.",
      author: "Jessica T."
    }
  ];
  
  return (
    <section className="py-16 bg-medical-bg-light dark:bg-medical-dark-bg">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-medical-primary to-medical-secondary rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-7/12 p-8 lg:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Experience Healthcare on Your Terms</h2>
              <p className="text-white/90 mb-8 leading-relaxed">
                Schedule your first consultation with Dr. Fintan today and discover how accessible and effective virtual healthcare can be. Same-day appointments often available.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
              
              <Link to="/booking">
                <Button className="bg-white text-medical-primary hover:bg-white/90">
                  Schedule Your Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((item, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                    <p className="text-white/90 text-sm italic mb-2">"{item.quote}"</p>
                    <p className="text-white/80 text-xs font-medium">— {item.author}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-5/12 bg-white/10 backdrop-blur-sm flex flex-col justify-center p-8 lg:p-12">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white mr-3">1</div>
                    <div>
                      <h4 className="text-white font-medium">Book Your Appointment</h4>
                      <p className="text-white/70 text-sm">Select a date and time that works for you</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white mr-3">2</div>
                    <div>
                      <h4 className="text-white font-medium">Receive Access Link</h4>
                      <p className="text-white/70 text-sm">Check your email for consultation details</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white mr-3">3</div>
                    <div>
                      <h4 className="text-white font-medium">Join Virtual Session</h4>
                      <p className="text-white/70 text-sm">Connect via video or audio for your consultation</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white mr-3">4</div>
                    <div>
                      <h4 className="text-white font-medium">Receive Care Plan</h4>
                      <p className="text-white/70 text-sm">Get personalized recommendations and next steps</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6 text-white mr-3" />
                <div>
                  <p className="text-white text-sm font-medium">Join 1,000+ patients who've chosen virtual care with Dr. Fintan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
