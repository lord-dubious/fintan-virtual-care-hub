
import React from 'react';
import { Calendar, Video, Clipboard, MessageSquare } from 'lucide-react';
const HowItWorks: React.FC = () => {
  const steps = [{
    icon: Calendar,
    title: "Book Your Appointment",
    description: "Choose a consultation type and select a convenient date and time slot from Dr. Fintan's availability.",
    color: "bg-medical-primary text-white"
  }, {
    icon: Clipboard,
    title: "Complete Pre-Visit Form",
    description: "Fill out a brief medical questionnaire to help Dr. Fintan prepare for your specific health concerns.",
    color: "bg-medical-secondary text-white"
  }, {
    icon: Video,
    title: "Join Virtual Consultation",
    description: "Connect with Dr. Fintan via our secure platform using your computer or mobile device for your appointment.",
    color: "bg-medical-accent text-medical-neutral-600"
  }, {
    icon: MessageSquare,
    title: "Receive Follow-Up Care",
    description: "Get a consultation summary, prescriptions if needed, and follow-up instructions after your visit.",
    color: "bg-medical-neutral-600 text-white"
  }];
  return <section className="py-16 bg-medical-bg-light dark:bg-medical-dark-bg">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="text-medical-primary font-medium">Simple Process</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">How Virtual Care Works</h2>
          <p className="text-medical-neutral-400 max-w-2xl mx-auto">
            Our streamlined virtual consultation process makes getting the care you need quick and convenient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mx-2 md:mx-4">
          {steps.map((step, index) => <div key={index} className="relative">
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-medical-bg-light flex items-center justify-center border-2 border-medical-primary text-medical-primary font-bold z-10">
                {index + 1}
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-medical-border-light z-0" style={{
            width: 'calc(100% - 20px)'
          }}></div>}
              
              <div className="border border-medical-border-light dark:border-medical-dark-border hover:shadow-lg transition-all duration-300 overflow-hidden dark:bg-medical-dark-surface px-6 py-6 rounded-xl">
                <div className={`w-14 h-14 ${step.color} rounded-lg flex items-center justify-center mb-4`}>
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-medical-neutral-600">{step.title}</h3>
                <p className="text-medical-neutral-400">{step.description}</p>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorks;
