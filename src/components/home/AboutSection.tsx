
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, ArrowRight } from 'lucide-react';

const AboutSection: React.FC = () => {
  const qualifications = [
    "Board Certified in Internal Medicine",
    "Specialized in Telemedicine since 2018",
    "Over 10,000 virtual consultations completed",
    "Master's in Global Health and Telehealth",
    "Award-winning patient satisfaction ratings"
  ];

  return (
    <section className="py-16 bg-medical-bg-light dark:bg-medical-dark-bg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-5/12">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-medical-accent/20 rounded-lg z-0"></div>
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Dr. Fintan in professional attire"
                className="rounded-lg shadow-lg z-10 relative"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-medical-dark-surface p-5 rounded-lg shadow-lg z-20 border-l-4 border-medical-primary dark:border-medical-accent">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-medical-primary dark:text-medical-accent mr-3" />
                  <div>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-bold">15+ Years</p>
                    <p className="text-medical-neutral-400 dark:text-medical-dark-text-secondary text-sm">Medical Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-7/12">
            <span className="text-medical-primary dark:text-medical-accent font-medium">About Dr. Fintan</span>
            <h2 className="text-3xl font-bold mt-2 mb-4 dark:text-medical-dark-text-primary">Dedicated to Accessible Healthcare Through Technology</h2>
            <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-6 leading-relaxed">
              Dr. Fintan brings over 15 years of medical expertise to his virtual practice, 
              combining traditional medical knowledge with telehealth innovation. 
              His approach focuses on personalized care, clear communication, and 
              leveraging technology to make quality healthcare accessible to all.
            </p>
            <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-8 leading-relaxed">
              After witnessing barriers to healthcare access, Dr. Fintan dedicated his 
              practice to virtual care, ensuring patients can receive expert medical 
              consultation regardless of location or mobility limitations.
            </p>
            
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3 text-medical-neutral-600 dark:text-medical-dark-text-primary">Qualifications & Expertise</h4>
              <ul className="space-y-2">
                {qualifications.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-medical-secondary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-medical-neutral-500 dark:text-medical-dark-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
              Learn More About Dr. Fintan <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
