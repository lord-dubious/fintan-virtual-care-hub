
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  if (currentStep >= totalSteps) return null;

  if (isMobile) {
    return (
      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="flex-1 h-12 text-base font-medium border-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <Button 
          onClick={onNext}
          disabled={!isStepValid}
          className={`${currentStep > 0 ? 'flex-[2]' : 'flex-1'} h-12 text-base font-medium bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90`}
        >
          {currentStep === totalSteps - 1 ? 'Complete Payment' : 'Continue'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20 px-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      
      <Button 
        onClick={onNext}
        disabled={!isStepValid}
        className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 px-8"
      >
        {currentStep === totalSteps - 1 ? 'Review & Pay' : 'Continue'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default BookingNavigation;
