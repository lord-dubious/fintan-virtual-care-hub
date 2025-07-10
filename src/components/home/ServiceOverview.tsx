import React from "react";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const ServiceOverview: React.FC = () => {
  const services = [
    {
      icon: Video,
      title: "Video Consultation",
      description: "Face-to-face virtual appointments with Dr. Fintan for comprehensive care and visual assessments.",
      features: [
        "Visual symptom assessment",
        "Prescription renewals when appropriate",
        "30-minute dedicated session",
        "Follow-up summary notes",
      ],
      color: "bg-medical-primary/10 text-medical-primary dark:bg-medical-primary/20 dark:text-medical-accent"
    },
    {
      icon: Headphones,
      title: "Audio Consultation",
      description: "Audio-only appointments perfect for follow-ups or issues that don't require visual examination.",
      features: [
        "Ideal for follow-up appointments",
        "Quick prescription reviews",
        "25-minute focused discussion",
        "Same expert medical advice",
      ],
      color: "bg-medical-secondary/10 text-medical-secondary dark:bg-medical-secondary/20 dark:text-medical-accent"
    },
    {
      icon: FileText,
      title: "Medical Reports",
      description: "Detailed medical documentation for insurance, referrals or personal records.",
      features: [
        "Comprehensive documentation",
        "Insurance-ready formatting",
        "Digital delivery within 48 hours",
        "Secure, HIPAA-compliant process",
      ],
      color: "bg-medical-accent/10 text-medical-accent dark:bg-medical-accent/20 dark:text-medical-accent"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-medical-dark-bg">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="text-medical-primary font-medium dark:text-medical-accent">Our Services</span>
          <h2 className="text-3xl font-bold mt-2 mb-4 dark:text-medical-dark-text-primary">Virtual Care Solutions</h2>
          <p className="text-medical-neutral-400 max-w-2xl mx-auto dark:text-medical-dark-text-secondary">
            Choose the consultation type that fits your needs, all delivered with expert care and personal attention to your healthcare journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {services.map((service, index) => (
            <Card key={index} className="border border-medical-border-light dark:border-medical-dark-border hover:shadow-lg transition-all duration-300 overflow-hidden dark:bg-medical-dark-surface h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon size={24} />
                </div>
                <CardTitle className="text-xl font-semibold text-medical-neutral-600 dark:text-medical-dark-text-primary">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-medical-neutral-400 mb-5 dark:text-medical-dark-text-secondary">
                  {service.description}
                </CardDescription>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <CheckCircle size={16} className="text-medical-secondary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-2 mt-auto">
                <Link to="/booking" className="w-full">
                  <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                    Learn More <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 bg-medical-bg-light dark:bg-medical-dark-surface/50 p-8 rounded-xl max-w-[95%] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-2 dark:text-medical-dark-text-primary">Payment Options</h3>
              <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                We offer transparent pricing and multiple payment methods to ensure healthcare remains accessible for everyone.
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10 dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent/10">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
