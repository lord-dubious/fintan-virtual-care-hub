import React from "react";


const ProfileSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <div className="w-40 h-40 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center overflow-hidden">
        <img 
          src="/Drekochin portrait.png" 
          alt="Dr. Fintan Ekochin" 
          className="w-full h-full object-cover object-center rounded-full"
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
          className="fallback-avatar text-5xl font-bold text-medical-primary dark:text-medical-accent"
          style={{ display: 'none' }}
        >
          FE
        </div>
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-semibold mb-2 dark:text-medical-dark-text-primary">Dr. Fintan Ekochin, MD</h2>
        <p className="text-medical-primary dark:text-medical-accent font-medium mb-3">Neurologist & Integrative Medicine Specialist</p>
        <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
          Dr Ekochin Fintan is one of two generations of the EKOCHIN Family of Doctors. He largely grew up in 
          Nigeria with some years of childhood spent in Austria, where he added German to his Igbo and English 
          language proficiency.
        </p>
        <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
          After completing Primary and Secondary schools in Enugu and Nsukka. He earned an MBBS from the premier 
          University of Nigeria, College of Medicine. Post graduation activities were first in the Paklose 
          Specialist Hospital before going to do House training in Internal Medicine at the University Teaching 
          Hospital both in New Delhi (2011).
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Neurology</span>
          <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Integrative Medicine</span>
          <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Lifestyle Medicine</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
