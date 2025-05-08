
import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ServiceOverview from "@/components/home/ServiceOverview";
import AboutSection from "@/components/home/AboutSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <Hero />
        
        {/* Mobile-specific content adjustments */}
        {isMobile ? (
          <>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <ServiceOverview />
            </div>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <AboutSection />
            </div>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <HowItWorks />
            </div>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <Testimonials />
            </div>
            <div className="pb-16">
              <CTASection />
            </div>
          </>
        ) : (
          <>
            <ServiceOverview />
            <AboutSection />
            <HowItWorks />
            <Testimonials />
            <CTASection />
          </>
        )}
      </main>
      
      {/* Footer only on desktop */}
      {!isMobile && <Footer />}
    </div>
  );
};

export default Index;
