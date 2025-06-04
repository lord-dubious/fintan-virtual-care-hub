
import React, { useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  ArrowRight,
  CheckCircle,
  Award,
  Globe,
  Users,
  Stethoscope,
  Brain,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const isMobile = useIsMobile();

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
      description: 'Face-to-face virtual consultation via secure video'
    },
    {
      id: 'audio',
      title: 'Audio Consultation', 
      price: '$65',
      duration: '30 mins',
      icon: Phone,
      description: 'Voice-only consultation for follow-ups and discussions'
    },
    {
      id: 'message',
      title: 'Messaging Consultation',
      price: '$45',
      duration: '24-48 hrs',
      icon: MessageSquare,
      description: 'Text-based consultation for non-urgent matters'
    }
  ];

  const expectations = [
    "Amalgamation of Orthodox and Alternative medicine",
    "Complementary, Functional, Orthomolecular approach",
    "Pharmacologically minimalist healthcare - most consultations end without drug prescriptions",
    "Focus on lifestyle medicine and natural healing approaches",
    "Efficient cross-border client care"
  ];

  const specialties = [
    {
      icon: Brain,
      title: "Neurological Care",
      description: "Expert diagnosis and treatment of neurological conditions"
    },
    {
      icon: Heart,
      title: "Integrative Medicine",
      description: "Combining traditional and alternative medicine approaches"
    },
    {
      icon: Stethoscope,
      title: "Lifestyle Medicine",
      description: "Focus on prevention through lifestyle modifications"
    }
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
                {/* Left: Dr. Profile & Bio */}
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
                  
                  {/* Bio */}
                  <div className="bg-white dark:bg-medical-dark-surface p-6 rounded-lg shadow-sm mb-6">
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4 leading-relaxed">
                      Dr. Fintan Ekochin is one of two generations of the EKOCHIN Family of Doctors. He largely grew up in 
                      Nigeria with some years of childhood spent in Austria, where he added German to his Igbo and English language 
                      proficiency.
                    </p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary leading-relaxed">
                      After completing Primary and Secondary schools in Nigeria and a University Preparatory course in Medical 
                      School in Vienna, he studied Medical Latin and completed a diploma in Radiographic equipment sales.
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {specialties.map((specialty, index) => (
                      <div key={index} className="text-center p-3 bg-white dark:bg-medical-dark-surface rounded-lg shadow-sm">
                        <specialty.icon className="h-6 w-6 text-medical-primary dark:text-medical-accent mx-auto mb-2" />
                        <div className="font-bold text-sm dark:text-medical-dark-text-primary">{specialty.title}</div>
                        <div className="text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary">{specialty.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Consultation Booking */}
                <div className="bg-white dark:bg-medical-dark-surface rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
                    Book Your Consultation
                  </h2>
                  
                  <div className="space-y-4 mb-6">
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
                    <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-6 text-lg">
                      Start Booking Process
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="text-center text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-4">
                    Available Monday-Saturday • Secure & Private
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What to Expect Section */}
        <section className="py-16 bg-white dark:bg-medical-dark-surface">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 dark:text-medical-dark-text-primary">
                What to Expect from Dr. Fintan
              </h2>
              <p className="text-lg text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-8">
                "My medical practice is an amalgamation of Orthodox and Alternative medicine, yielding a blend of 
                Complementary, Functional, Orthomolecular, and Lifestyle Medicine."
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {expectations.map((expectation, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary text-left">{expectation}</span>
                  </div>
                ))}
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
