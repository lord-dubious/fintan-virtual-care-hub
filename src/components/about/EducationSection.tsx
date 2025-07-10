import React from "react";


const EducationSection = () => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Education & Credentials</h3>
      <ul className="space-y-3">
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium dark:text-medical-dark-text-primary">Medical Education</p>
            <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">Started in Vienna, Austria and completed in Nigeria</p>
          </div>
        </li>
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium dark:text-medical-dark-text-primary">Residency in Internal Medicine</p>
            <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">University of Nigeria Teaching Hospital with rotations in India</p>
          </div>
        </li>
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium dark:text-medical-dark-text-primary">Fellowship</p>
            <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">Fellow of the West African College of Physicians (since 2016)</p>
          </div>
        </li>
        <li className="flex items-start">
          <CheckCircle className="h-5 w-5 text-medical-primary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium dark:text-medical-dark-text-primary">International Experience</p>
            <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">Neurology practice at Forsyth Medical Center, North Carolina, USA (2015/2016)</p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default EducationSection;
