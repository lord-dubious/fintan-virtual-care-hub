
import React, { useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ArrowRight,
  CheckCircle,
  Brain,
  Heart,
  Stethoscope,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    },
    {
      icon: Globe,
      title: "Cross-Border Care",
      description: "Virtual healthcare accessible from anywhere"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        {/* Hero Section with Large Dr. Profile Card */}
        <section className="bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Large Profile Card */}
              <Card className="mb-8 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Profile Image */}
                    <div className="relative bg-gradient-to-br from-medical-primary/10 to-medical-accent/10 dark:from-medical-primary/20 dark:to-medical-accent/20 flex items-center justify-center min-h-[300px] lg:min-h-[400px] overflow-hidden">
                      <img 
                        src="/Drekochin portrait.png" 
                        alt="Dr. Fintan Ekochin" 
                        className="w-full h-full object-cover object-center"
                        style={{ display: 'block' }}
                        onError={(e) => {
                          console.log('Image failed to load:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully');
                        }}
                      />
                    </div>
                    
                    {/* Profile Info */}
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                      <h1 className="text-3xl md:text-4xl font-bold mb-3 dark:text-medical-dark-text-primary">
                        Dr. Fintan Ekochin, MD
                      </h1>
                      <p className="text-xl text-medical-primary dark:text-medical-accent font-medium mb-4">
                        Neurologist & Integrative Medicine Specialist
                      </p>
                      
                      <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-6 leading-relaxed">
                        Dr. Fintan Ekochin is one of two generations of the EKOCHIN Family of Doctors. He largely grew up in 
                        Nigeria with some years of childhood spent in Austria, where he added German to his Igbo and English 
                        language proficiency.
                      </p>

                      <Link to="/booking">
                        <Button className="w-full lg:w-auto bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-3 px-8 text-lg transform hover:scale-105 transition-all duration-200 active:scale-95">
                          Book Your Consultation
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialties Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {specialties.map((specialty, index) => (
                  <Card key={index} className="text-center p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-medical-primary/5 dark:hover:bg-medical-accent/5 cursor-pointer active:scale-95">
                    <CardContent className="p-0">
                      <specialty.icon className="h-8 w-8 text-medical-primary dark:text-medical-accent mx-auto mb-3 transition-transform duration-200 group-hover:scale-110" />
                      <h3 className="font-bold text-sm mb-2 dark:text-medical-dark-text-primary">{specialty.title}</h3>
                      <p className="text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary">{specialty.description}</p>
                    </CardContent>
                  </Card>
                ))}
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
                  <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left hover:bg-medical-primary/5 dark:hover:bg-medical-accent/5 transition-all duration-300 transform hover:scale-105 cursor-pointer active:scale-95">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="dark:text-medical-dark-text-secondary">{expectation}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/booking">
                  <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-3 px-8 text-lg transform hover:scale-105 transition-all duration-200 active:scale-95">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
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
