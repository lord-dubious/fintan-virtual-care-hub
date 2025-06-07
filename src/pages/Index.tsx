
import React, { useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Globe,
  Heart,
  Pill
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
      icon: Stethoscope,
      title: "Evidence-Based Medicine",
      description: "Using scientifically proven treatments and diagnostic methods"
    },
    {
      icon: Heart,
      title: "Functional Medicine", 
      description: "Treating symptoms and identifying root causes"
    },
    {
      icon: Pill,
      title: "Integrative Medicine",
      description: "Combining conventional and complementary therapies"
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
      
      <main className={`flex-grow ${isMobile ? 'mobile-content px-4' : ''}`}>
        {/* Hero Section with Large Dr. Profile Card */}
        <section className={`bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10 ${isMobile ? 'py-6' : 'py-12 md:py-20'}`}>
          <div className={`${isMobile ? '' : 'container mx-auto px-4'}`}>
            <div className="max-w-4xl mx-auto">
              {/* Large Profile Card */}
              <Card className={`mb-6 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${isMobile ? 'mx-2' : 'mb-8'}`}>
                <CardContent className="p-0">
                  <div className={`${isMobile ? 'flex flex-col' : 'grid lg:grid-cols-2'} gap-0`}>
                    {/* Profile Image */}
                    <div className={`relative bg-gradient-to-br from-medical-primary/10 to-medical-accent/10 dark:from-medical-primary/20 dark:to-medical-accent/20 flex items-center justify-center ${isMobile ? 'h-48' : 'min-h-[300px] lg:min-h-[400px]'} overflow-hidden`}>
                      <img 
                        src="/lovable-uploads/f9f43bab-1cfa-4a52-932b-418da532abc2.png" 
                        alt="Dr. Fintan Ekochin" 
                        className={`${isMobile ? 'w-full h-full object-cover object-center' : 'w-full h-full object-cover object-center'}`}
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
                    <div className={`${isMobile ? 'p-4' : 'p-6 lg:p-8'} flex flex-col justify-center`}>
                      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-3 dark:text-medical-dark-text-primary`}>
                        Dr. Fintan Ekochin, MD
                      </h1>
                      <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-medical-primary dark:text-medical-accent font-medium mb-4`}>
                        Fellow of the West African College of Physicians
                      </p>
                      
                      <p className={`text-medical-neutral-600 dark:text-medical-dark-text-secondary ${isMobile ? 'mb-4 text-sm leading-relaxed' : 'mb-6 leading-relaxed'}`}>
                        Dr. Ekochin Fintan is one of the rising doctors in the EKOCHIN Family of Doctors. He largely grew up in 
                        Nigeria with some years of childhood spent in Austria, Germany and the German he had later to his Igbo and cultural language 
                        proficiency.
                      </p>

                      <Link to="/booking">
                        <Button className={`${isMobile ? 'w-full py-3 px-6 text-base' : 'w-full lg:w-auto py-3 px-8 text-lg'} bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 transform hover:scale-105 transition-all duration-200 active:scale-95`}>
                          Book Your Consultation
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialties Grid */}
              <div className={`grid grid-cols-2 ${isMobile ? 'gap-3 mx-2' : 'lg:grid-cols-4 gap-4 mb-8'}`}>
                {specialties.map((specialty, index) => (
                  <Card key={index} className={`text-center ${isMobile ? 'p-3' : 'p-4'} hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-medical-primary/5 dark:hover:bg-medical-accent/5 cursor-pointer active:scale-95`}>
                    <CardContent className="p-0">
                      <specialty.icon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-medical-primary dark:text-medical-accent mx-auto mb-3 transition-transform duration-200 group-hover:scale-110`} />
                      <h3 className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'} mb-2 dark:text-medical-dark-text-primary`}>{specialty.title}</h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-medical-neutral-600 dark:text-medical-dark-text-secondary`}>{specialty.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What to Expect Section */}
        <section className={`${isMobile ? 'py-8 px-2' : 'py-16'} bg-white dark:bg-medical-dark-surface`}>
          <div className={`${isMobile ? '' : 'container mx-auto px-4'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-6 dark:text-medical-dark-text-primary`}>
                What to Expect from Dr. Fintan
              </h2>
              <p className={`${isMobile ? 'text-base px-2' : 'text-lg'} text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-8`}>
                "My medical practice is an amalgamation of Orthodox and Alternative medicine, yielding a blend of 
                Complementary, Functional, Orthomolecular, and Lifestyle Medicine."
              </p>
              
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3 px-2' : 'md:grid-cols-2 gap-6'}`}>
                {expectations.map((expectation, index) => (
                  <div key={index} className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} bg-gray-50 dark:bg-gray-800 rounded-lg text-left hover:bg-medical-primary/5 dark:hover:bg-medical-accent/5 transition-all duration-300 transform hover:scale-105 cursor-pointer active:scale-95`}>
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className={`${isMobile ? 'text-sm' : ''} dark:text-medical-dark-text-secondary`}>{expectation}</span>
                  </div>
                ))}
              </div>

              <div className={`${isMobile ? 'mt-6 px-2' : 'mt-10'}`}>
                <Link to="/booking">
                  <Button className={`${isMobile ? 'w-full py-3 px-6 text-base' : 'py-3 px-8 text-lg'} bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 transform hover:scale-105 transition-all duration-200 active:scale-95`}>
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
