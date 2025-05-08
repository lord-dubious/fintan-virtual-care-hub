
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Headphones, ArrowRight, Clock, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ServiceOverview: React.FC = () => {
  const services = [
    {
      icon: Video,
      title: "Video Consultation",
      description: "Face-to-face virtual appointments with Dr. Fintan for comprehensive care and visual assessments.",
      price: "$80",
      duration: "30 minutes",
      color: "bg-medical-primary/10 text-medical-primary"
    },
    {
      icon: Headphones,
      title: "Audio Consultation",
      description: "Audio-only appointments perfect for follow-ups or issues that don't require visual examination.",
      price: "$60",
      duration: "25 minutes",
      color: "bg-medical-secondary/10 text-medical-secondary"
    },
    {
      icon: FileText,
      title: "Medical Reports",
      description: "Detailed medical reports and documentation for insurance, referrals or personal records.",
      price: "$40",
      duration: "N/A",
      color: "bg-medical-accent/10 text-medical-accent"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-medical-primary font-medium">Our Services</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Virtual Care Options</h2>
          <p className="text-medical-neutral-400 max-w-2xl mx-auto">
            Choose the consultation type that best fits your needs, all delivered with the same expert care and personal attention.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {services.map((service, index) => (
            <Card key={index} className="border border-medical-border-light hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon size={24} />
                </div>
                <CardTitle className="text-xl font-semibold text-medical-neutral-600">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-medical-neutral-400 mb-4">
                  {service.description}
                </CardDescription>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-medical-neutral-500">
                    <Clock size={16} className="mr-2" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center font-medium text-medical-primary text-lg">
                    {service.price}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 mt-2">
                  Book Now <ArrowRight size={16} className="ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10">
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
