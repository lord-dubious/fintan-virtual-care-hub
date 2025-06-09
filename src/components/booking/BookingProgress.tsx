
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles
}) => {
  const getStepStatus = (step: number) => {
    if (step === currentStep) return "current";
    if (step < currentStep) return "completed";
    return "upcoming";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          return (
            <div key={stepNumber} className="flex flex-col items-center relative z-10 flex-1">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all mb-2",
                  status === "completed" ? "bg-green-500 text-white" : 
                  status === "current" ? "bg-medical-primary dark:bg-medical-accent text-white dark:text-medical-dark-surface" : 
                  "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                )}
              >
                {status === "completed" ? <CheckCircle className="h-5 w-5" /> : stepNumber}
              </div>
              <span 
                className={cn(
                  "text-xs text-center max-w-24",
                  status === "completed" ? "text-green-600 dark:text-green-400" : 
                  status === "current" ? "text-medical-primary dark:text-medical-accent font-medium" : 
                  "text-gray-500 dark:text-gray-400"
                )}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress line */}
      <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded">
        <div 
          className="absolute top-0 left-0 h-full bg-green-500 rounded transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BookingProgress;
