
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutSection: React.FC = () => {
  const qualifications = [
    "Fellow of the West African College of Physicians",
    "Head of Neurology at ESUT Teaching Hospital Enugu",
    "Senior Lecturer for Neurophysiology at Godfrey Okoye University",
    "Former Commissioner for Health, Enugu State (2017-2019)",
    "Experienced in Neurology practice in Nigeria, India and USA"
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
                alt="Dr. Ekochin in professional attire"
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
            <span className="text-medical-primary dark:text-medical-accent font-medium">About Dr. Ekochin</span>
            <h2 className="text-3xl font-bold mt-2 mb-4 dark:text-medical-dark-text-primary">Dedicated to Integrative Healthcare Approaches</h2>
            <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-6 leading-relaxed">
              Dr. Ekochin Fintan comes from two generations of the EKOCHIN Family of Doctors. 
              With proficiency in Igbo, English, and German, he brings a global perspective to his 
              practice after completing his medical education in Nigeria and Austria, with further 
              specialist training in India and the United States.
            </p>
            <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary mb-8 leading-relaxed">
              His approach combines Orthodox and Alternative medicine, creating a unique blend of 
              Complementary, Functional, Orthomolecular, and Lifestyle Medicine that delivers a 
              pharmacologically minimalist approach to healthcare, making it ideal for cross-border virtual care.
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
            
            <Link to="/about">
              <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                Learn More About Dr. Ekochin <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
