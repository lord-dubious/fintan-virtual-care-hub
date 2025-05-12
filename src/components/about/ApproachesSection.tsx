
import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface MedicineApproach {
  title: string;
  points: string[];
}

interface ApproachesSectionProps {
  approaches: MedicineApproach[];
}

const ApproachesSection = ({ approaches }: ApproachesSectionProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Medical Approaches</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approaches.map((approach, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h4 className="font-medium text-medical-primary dark:text-medical-accent mb-2">{approach.title}</h4>
            <ul className="space-y-1">
              {approach.points.map((point, pointIndex) => (
                <li key={pointIndex} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-medical-secondary dark:text-medical-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApproachesSection;
