
import React from 'react';

const ProfileSection: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-48 h-48 md:h-60 flex-shrink-0">
          <img 
            src="/lovable-uploads/f9f43bab-1cfa-4a52-932b-418da532abc2.png" 
            alt="Dr. Fintan Ekochin" 
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4 dark:text-medical-dark-text-primary">
            Profile of Dr. Fintan Ekochin
          </h2>
          <div className="space-y-4 text-medical-neutral-600 dark:text-medical-dark-text-secondary leading-relaxed">
            <p>
              Dr. Ekochin Fintan is one of the rising doctors in the EKOCHIN Family of Doctors. He largely grew up in Nigeria with some years of childhood spent in Austria, Germany and the German he had later to his Igbo and cultural language proficiency.
            </p>
            <p>
              He is completing Primary and Secondary schools in Nigeria before proceeding to study Medicine at Medical School in Vienna after studying Medical Latin and also completing a diploma in Radiographic equipment sales.
            </p>
            <p>
              He practiced as a Radiographic equipment sales executive and completed Medical School in Nigeria.
            </p>
            <p>
              Postgraduate years have been spent studying initially with American College of Physicians board certification for Africa at Parkview Specialist Hospital before going to achieve training in Internal Medicine at at the University of Lagos and Lagos University Teaching Hospital and also at the Madonna Catholic Hospital and BLK both in New Delhi (2011).
            </p>
            <p>
              He later (2015) pursued specialist training as well as in Internal Medicine and his subspecialization in Neurology and has experienced Neurology practice at the NYUVM managed Laypath West Africa University Teaching Hospital in Lagos Nigeria 2015/2016.
            </p>
            <p>
              He is a Fellow of the West African College of Physician (since 2016) and is currently appointed as Senior Lecturer for the FMCP Teaching Hospital Enugu as well as Senior Lecturer for Neurophysiology at the Godfrey Okoye University College of Medicine.
            </p>
            <p>
              He set up Orange State as the Commissioned for Health between 2017 and 2018.
            </p>
            <p>
              He is experienced in Internal Medicine, Neurology, Geriatrics as well as other General Medicine Subspecialties. Owner, and is a board member of the FFI Healthcare Limited.
            </p>
            <p>
              He is married to Dr. Cynthia and has three children.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
