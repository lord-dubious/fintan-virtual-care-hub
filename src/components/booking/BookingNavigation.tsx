import React from "react";

import { Button } from "@/components/ui/button";

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const BookingNavigation: React.FC<BookingNavigationProps> = ({
  currentStep,
  totalSteps,
  isStepValid,
  onPrevious,
  onNext
}) => {
  if (currentStep >= totalSteps) return null;

  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20 px-8"
      >
        Previous
      </Button>
      
      <Button 
        onClick={onNext}
        disabled={!isStepValid}
        className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 px-8"
      >
        {currentStep === totalSteps - 1 ? 'Review & Pay' : 'Continue'}
      </Button>
    </div>
  );
};

export default BookingNavigation;
