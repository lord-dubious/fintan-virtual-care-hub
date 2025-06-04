
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Users,
  Globe,
  Award,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const consultationTypes = [
    {
      id: 'video',
      title: 'Video Consultation',
      price: '$85',
      duration: '30 mins',
      icon: Video,
      description: 'Face-to-face virtual consultation via secure video',
      features: ['Visual assessment', 'Real-time interaction', 'Prescription if needed']
    },
    {
      id: 'audio',
      title: 'Audio Consultation',
      price: '$65',
      duration: '30 mins',
      icon: Phone,
      description: 'Voice-only consultation for follow-ups and discussions',
      features: ['High-quality audio', 'Lower bandwidth', 'Perfect for follow-ups']
    },
    {
      id: 'message',
      title: 'Messaging Consultation',
      price: '$45',
      duration: '24-48 hrs',
      icon: MessageSquare,
      description: 'Text-based consultation for non-urgent matters',
      features: ['Detailed written response', 'Flexible timing', 'Medical advice']
    }
  ];

  const stats = [
    { icon: Users, label: 'Patients Served', value: '2,000+' },
    { icon: Globe, label: 'Countries', value: '15+' },
    { icon: Award, label: 'Years Experience', value: '10+' },
    { icon: Clock, label: 'Available', value: '6 Days/Week' }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        {/* Hero Section with Dr. Profile */}
        <section className="bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Dr. Profile */}
                <div className="text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-6">
                    <div className="w-32 h-32 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center overflow-hidden">
                      <div className="text-6xl font-bold text-medical-primary dark:text-medical-accent">F</div>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-medical-dark-text-primary">
                    Dr. Fintan Ekochin, MD
                  </h1>
                  <p className="text-xl text-medical-primary dark:text-medical-accent font-medium mb-4">
                    Neurologist & Integrative Medicine Specialist
                  </p>
                  
                  <div className="bg-white dark:bg-medical-dark-surface p-6 rounded-lg shadow-sm mb-6">
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary italic mb-4">
                      "My medical practice is an amalgamation of Orthodox and Alternative medicine, yielding a blend of Complementary, Functional, Orthomolecular, and Lifestyle Medicine. This delivers a pharmacologically minimalist approach to healthcare."
                    </p>
                    <p className="font-medium dark:text-medical-dark-text-primary">— Dr. Fintan Ekochin</p>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Neurology</span>
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Integrative Medicine</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm">
                        <stat.icon className="h-6 w-6 text-medical-primary dark:text-medical-accent mx-auto mb-2" />
                        <div className="font-bold text-lg dark:text-medical-dark-text-primary">{stat.value}</div>
                        <div className="text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Quick Booking */}
                <div className="bg-white dark:bg-medical-dark-surface rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
                    Book Your Consultation
                  </h2>
                  
                  <div className="space-y-4">
                    {consultationTypes.map((type) => (
                      <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow border-medical-border-light dark:border-medical-dark-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center">
                                <type.icon className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
                              </div>
                              <div>
                                <h3 className="font-semibold dark:text-medical-dark-text-primary">{type.title}</h3>
                                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{type.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-medical-primary dark:text-medical-accent">{type.price}</div>
                              <div className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary">{type.duration}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Link to="/booking">
                    <Button className="w-full mt-6 bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-6 text-lg">
                      Start Booking Process
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="text-center text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-4">
                    Available Monday-Saturday • Secure & HIPAA Compliant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Simplified */}
        <section className="py-16 bg-white dark:bg-medical-dark-surface">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-medical-dark-text-primary">
              Simple 3-Step Process
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-medical-primary dark:text-medical-accent">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 dark:text-medical-dark-text-primary">Choose & Book</h3>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    Select your consultation type and preferred time slot
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-medical-primary dark:text-medical-accent">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 dark:text-medical-dark-text-primary">Complete Payment</h3>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    Secure payment with multiple options available
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-medical-primary dark:text-medical-accent">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 dark:text-medical-dark-text-primary">Meet Dr. Ekochin</h3>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    Join your consultation at the scheduled time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-xl font-semibold mb-8 dark:text-medical-dark-text-primary">
                Trusted by Patients Worldwide
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="dark:text-medical-dark-text-secondary">HIPAA Compliant</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="dark:text-medical-dark-text-secondary">Board Certified</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="dark:text-medical-dark-text-secondary">Secure Platform</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="dark:text-medical-dark-text-secondary">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {!isMobile && <Footer />}
    </div>
  );
};

export default Index;
