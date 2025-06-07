
import React from 'react';

const PhilosophySection = () => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Philosophy of Care</h3>
      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-md border-l-4 border-medical-primary dark:border-medical-accent">
        <p className="italic text-medical-neutral-600 dark:text-medical-dark-text-secondary">
          "My medical practice is an amalgamation of Orthodox and Alternative medicine, yielding a blend of Complementary, Functional, Orthomolecular, and Lifestyle Medicine. This delivers a pharmacologically minimalist approach to healthcare. Most consultations end without a drug prescription, which makes for efficient cross-border client care."
        </p>
        <p className="mt-3 font-medium dark:text-medical-dark-text-primary">— Dr. Fintan Ekochin</p>
      </div>
    </div>
  );
};

export default PhilosophySection;
