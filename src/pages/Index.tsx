import React from "react";

import { useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ArrowRight,
  CheckCircle,
  Heart,
  Stethoscope,
  Globe,
  Calendar,
  Video,
  Shield
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
      icon: Heart,
      title: "Integrative Medicine", 
      description: "Combining traditional and alternative approaches"
    },
    {
      icon: Stethoscope,
      title: "Lifestyle Medicine",
      description: "Prevention through lifestyle modifications"
    },
    {
      icon: Globe,
      title: "Virtual Care",
      description: "Accessible healthcare from anywhere"
    }
  ];

  const features = [
    {
      icon: Video,
      title: "HD Video Consultations",
      description: "Crystal clear video calls with screen sharing"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered appointment booking system"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA compliant with end-to-end encryption"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      
      <main className={`flex-grow ${isMobile ? 'mobile-content px-4' : ''}`}>
        {/* Hero Section */}
        <section className={`${isMobile ? 'py-8' : 'py-16 md:py-24'}`}>
          <div className={`${isMobile ? '' : 'container mx-auto px-4'}`}>
            <div className="max-w-7xl mx-auto">
              {/* Main Profile Card */}
              <Card className={`mb-8 overflow-hidden shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${isMobile ? 'mx-2' : ''}`}>
                <CardContent className="p-0">
                  <div className={`${isMobile ? 'flex flex-col' : 'grid lg:grid-cols-5'} gap-0`}>
                    {/* Profile Image */}
                    <div className={`${isMobile ? 'order-1' : 'lg:col-span-2'} relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center overflow-hidden`}>
                      <div className={`${isMobile ? 'w-full h-80' : 'w-full h-96 lg:h-[500px]'} relative`}>
                        <img 
                          src="/Drekochin portrait.png" 
                          alt="Dr. Fintan Ekochin" 
                          className="w-full h-full object-cover object-center"
                          style={{ display: 'block' }}
                          onError={(e) => {
                            console.log('Image failed to load:', e);
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-avatar');
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div 
                          className="fallback-avatar absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-900 flex items-center justify-center text-6xl font-bold text-blue-600 dark:text-blue-300"
                          style={{ display: 'none' }}
                        >
                          FE
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile Info - Updated with detailed content from document */}
                    <div className={`${isMobile ? 'order-2 p-6' : 'lg:col-span-3 p-8 lg:p-12'} flex flex-col justify-center bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20`}>
                      <div className="mb-4">
                        <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                          Dr. Fintan Ekochin, MD
                        </h1>
                        <p className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} text-blue-600 dark:text-blue-400 font-medium mb-6`}>
                          Fellow WACP • Neurologist • Integrative Medicine Specialist
                        </p>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm leading-relaxed' : 'text-base leading-relaxed'}`}>
                          Dr. Ekochin Fintan is one of two generations of the EKOCHIN Family of Doctors. He largely grew up in 
                          Nigeria with some years of childhood spent in Austria, where he added German to his Igbo and English 
                          language proficiency.
                        </p>
                        
                        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm leading-relaxed' : 'text-base leading-relaxed'}`}>
                          After completing Primary and Secondary schools in Enugu and Nsukka, he earned an MBBS from the premier 
                          University of Nigeria, College of Medicine. Post graduation activities were first in the Paklose 
                          Specialist Hospital before going to do House training in Internal Medicine at the University Teaching 
                          Hospital both in New Delhi (2011).
                        </p>

                        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm leading-relaxed' : 'text-base leading-relaxed'}`}>
                          He later completed neurology residency in India and the USA, earning Fellowship of the West African 
                          College of Physicians. He currently serves as Head of Neurology at ESUT Teaching Hospital Enugu and 
                          Senior Lecturer for Neurophysiology at Godfrey Okoye University.
                        </p>

                        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm leading-relaxed' : 'text-base leading-relaxed'}`}>
                          Dr. Ekochin served as Commissioner for Health, Enugu State (2017-2019), bringing extensive leadership 
                          experience to healthcare administration and policy development.
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">Fellow WACP</span>
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium">Integrative Medicine</span>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm rounded-full font-medium">Lifestyle Medicine</span>
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm rounded-full font-medium">Former Health Commissioner</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/booking" className="flex-1">
                          <Button className={`w-full ${isMobile ? 'py-4 px-6 text-base' : 'py-4 px-8 text-lg'} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                            Book Consultation
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        <Link to="/about" className="flex-1">
                          <Button variant="outline" className={`w-full ${isMobile ? 'py-4 px-6 text-base' : 'py-4 px-8 text-lg'} border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 transition-all duration-300`}>
                            Learn More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4 mx-2' : 'md:grid-cols-3 gap-6'} mb-12`}>
                {features.map((feature, index) => (
                  <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                      <feature.icon className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-blue-600 dark:text-blue-400 mx-auto mb-4`} />
                      <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} mb-3 text-gray-900 dark:text-gray-100`}>{feature.title}</h3>
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 dark:text-gray-300`}>{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Specialties Grid - Removed Neurology card */}
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3 mx-2' : 'lg:grid-cols-3 gap-4'}`}>
                {specialties.map((specialty, index) => (
                  <Card key={index} className={`text-center ${isMobile ? 'p-4' : 'p-6'} bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-white dark:hover:bg-gray-800`}>
                    <CardContent className="p-0">
                      <specialty.icon className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-blue-600 dark:text-blue-400 mx-auto mb-3`} />
                      <h3 className={`font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-2 text-gray-900 dark:text-gray-100`}>{specialty.title}</h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300`}>{specialty.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section - Updated with exact quote from document */}
        <section className={`${isMobile ? 'py-12 px-2' : 'py-20'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm`}>
          <div className={`${isMobile ? '' : 'container mx-auto px-4'}`}>
            <div className="max-w-5xl mx-auto text-center">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                What to expect from a virtual consultation with Dr. Fintan
              </h2>
              
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-600 shadow-xl">
                <CardContent className={`${isMobile ? 'p-6' : 'p-8'}`}>
                  <blockquote className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'} italic text-gray-700 dark:text-gray-300 mb-6 leading-relaxed`}>
                    "Dr. Fintan's medical practice is an amalgamation of Orthodox and Alternative medicine, 
                    yielding a blend of Complementary, Functional, Orthomolecular, and Lifestyle Medicine. 
                    This delivers a pharmacologically minimalist approach to healthcare. Most consultations 
                    end without a drug prescription, which makes for efficient cross border client care."
                  </blockquote>
                  <p className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} text-blue-600 dark:text-blue-400`}>— Dr. Fintan Ekochin</p>
                </CardContent>
              </Card>
              
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4 px-2 mt-8' : 'md:grid-cols-2 gap-6 mt-12'}`}>
                {expectations.map((expectation, index) => (
                  <div key={index} className={`flex items-start gap-4 ${isMobile ? 'p-4' : 'p-6'} bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 dark:text-gray-300 leading-relaxed`}>{expectation}</span>
                  </div>
                ))}
              </div>

              <div className={`${isMobile ? 'mt-8 px-2' : 'mt-12'}`}>
                <Link to="/booking">
                  <Button className={`${isMobile ? 'w-full py-4 px-6 text-base' : 'py-4 px-8 text-lg'} bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                    Begin Your Health Journey
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
