
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, GraduationCap } from 'lucide-react';

const CTASection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA-compliant platform with end-to-end encryption for your privacy."
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book appointments that fit your schedule, including evenings and weekends."
    },
    {
      icon: GraduationCap,
      title: "Expert Care",
      description: "Receive care from a board-certified physician with telehealth expertise."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-medical-primary to-medical-secondary rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-7/12 p-8 lg:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ready to Experience Quality Virtual Healthcare?</h2>
              <p className="text-white/90 mb-8 leading-relaxed">
                Schedule your first consultation with Dr. Fintan today and discover how convenient and effective virtual healthcare can be. Same-day appointments are often available.
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
              
              <Button className="bg-white text-medical-primary hover:bg-white/90">
                Book Your Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="lg:w-5/12 bg-white/10 backdrop-blur-sm flex items-center justify-center p-8 lg:p-12">
              <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm">
                <h4 className="text-xl font-bold mb-4 text-medical-primary text-center">Virtual Consultation</h4>
                <div className="flex justify-between mb-2 py-2 border-b border-medical-border-light">
                  <span className="text-medical-neutral-600">Initial Consultation</span>
                  <span className="font-semibold">$80</span>
                </div>
                <div className="flex justify-between mb-2 py-2 border-b border-medical-border-light">
                  <span className="text-medical-neutral-600">Follow-up Visit</span>
                  <span className="font-semibold">$60</span>
                </div>
                <div className="flex justify-between mb-4 py-2 border-b border-medical-border-light">
                  <span className="text-medical-neutral-600">Prescription Renewal</span>
                  <span className="font-semibold">$40</span>
                </div>
                
                <div className="bg-medical-bg-light rounded-lg p-4 mb-4">
                  <p className="text-sm text-medical-neutral-500">Most insurance plans accepted. Verification required at booking.</p>
                </div>
                
                <Button className="w-full bg-medical-primary hover:bg-medical-primary/90">
                  Check Availability
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
