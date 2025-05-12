
import React from 'react';
import { CheckCircle } from 'lucide-react';

const ProfileSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <div className="w-40 h-40 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center overflow-hidden">
        {/* Placeholder for doctor's image */}
        <div className="text-5xl font-bold text-medical-primary dark:text-medical-accent">E</div>
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-semibold mb-2 dark:text-medical-dark-text-primary">Dr. Ekochin Fintan, MD</h2>
        <p className="text-medical-primary dark:text-medical-accent font-medium mb-3">Neurologist & Integrative Medicine Specialist</p>
        <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
          Dr. Ekochin Fintan is one of two generations of the EKOCHIN Family of Doctors. He grew up in 
          Nigeria with some years of childhood spent in Austria, where he added German to his Igbo and English 
          language proficiency.
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Neurology</span>
          <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Integrative Medicine</span>
          <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Telemedicine</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
