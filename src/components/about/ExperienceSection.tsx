import React from "react";


const ExperienceSection = () => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Professional Experience</h3>
      <div className="space-y-4">
        <div>
          <p className="font-medium dark:text-medical-dark-text-primary">Head of Neurology</p>
          <p className="text-medical-primary dark:text-medical-accent">ESUT Teaching Hospital, Enugu</p>
          <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
            Leading the neurology department and providing specialized care to patients with neurological conditions.
          </p>
        </div>
        <div>
          <p className="font-medium dark:text-medical-dark-text-primary">Senior Lecturer</p>
          <p className="text-medical-primary dark:text-medical-accent">Godfrey Okoye University College of Medicine</p>
          <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
            Teaching Neurophysiology and training the next generation of medical professionals.
          </p>
        </div>
        <div>
          <p className="font-medium dark:text-medical-dark-text-primary">Commissioner for Health</p>
          <p className="text-medical-primary dark:text-medical-accent">Enugu State (2017-2019)</p>
          <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
            Served in public health leadership, overseeing healthcare policies and initiatives for the state.
          </p>
        </div>
        <div>
          <p className="font-medium dark:text-medical-dark-text-primary">Consultant</p>
          <p className="text-medical-primary dark:text-medical-accent">Regions Hospital Enugu in affiliation with Regions Neurosciences, Owerri</p>
          <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
            Providing specialized neurological consultations and care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;
