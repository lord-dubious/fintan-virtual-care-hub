
import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileSection from '@/components/about/ProfileSection';
import EducationSection from '@/components/about/EducationSection';
import PhilosophySection from '@/components/about/PhilosophySection';
import ExperienceSection from '@/components/about/ExperienceSection';
import ApproachesSection from '@/components/about/ApproachesSection';
import CtaSection from '@/components/about/CtaSection';
import { medicineApproaches } from '@/components/about/MedicineApproachesData';

const AboutPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
              About Dr. Ekochin Fintan
            </h1>
            
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-10">
              {/* Doctor's profile */}
              <ProfileSection />
              
              {/* Education & Credentials */}
              <EducationSection />
              
              {/* Philosophy of Care */}
              <PhilosophySection />
              
              {/* Professional Experience */}
              <ExperienceSection />
              
              {/* Medical Approaches */}
              <ApproachesSection approaches={medicineApproaches} />
            </div>
            
            {/* CTA Section */}
            <CtaSection />
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default AboutPage;
