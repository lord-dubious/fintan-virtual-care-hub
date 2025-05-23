
import React, { useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ServiceOverview from "@/components/home/ServiceOverview";
import AboutSection from "@/components/home/AboutSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import { useIsMobile } from '@/hooks/use-mobile';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';

const Index = () => {
  const isMobile = useIsMobile();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      
      {/* Breadcrumb navigation - desktop only */}
      {!isMobile && (
        <div className="container mx-auto px-4 py-2">
          <BreadcrumbNav 
            items={[
              { label: 'Home', href: '/', active: true }
            ]} 
          />
        </div>
      )}
      
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <Hero />
        
        {/* Mobile-specific content adjustments */}
        {isMobile ? (
          <>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <HowItWorks />
            </div>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <AboutSection />
            </div>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <ServiceOverview />
            </div>
            <div className="border-t border-medical-border-light dark:border-medical-dark-border pt-4">
              <Testimonials />
            </div>
            <div className="pb-20">
              <CTASection />
            </div>
          </>
        ) : (
          <>
            <HowItWorks />
            <AboutSection />
            <ServiceOverview />
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
