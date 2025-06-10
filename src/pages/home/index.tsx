
import React from 'react';
import Hero from '@/components/home/Hero';
import ServiceOverview from '@/components/home/ServiceOverview';
import HowItWorks from '@/components/home/HowItWorks';
import AboutSection from '@/components/home/AboutSection';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServiceOverview />
      <HowItWorks />
      <AboutSection />
      <Testimonials />
      <CTASection />
    </div>
  );
};

export default Home;
