
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface BookingHeaderProps {
  totalSteps: number;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ totalSteps }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4 text-medical-neutral-600 dark:text-medical-dark-text-secondary hover:text-medical-primary dark:hover:text-medical-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      <h1 className="text-3xl md:text-4xl font-bold dark:text-medical-dark-text-primary">
        Book with Dr. Fintan Ekochin
      </h1>
      <p className="mt-2 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
        Complete your consultation booking in {totalSteps} simple steps
      </p>
    </div>
  );
};

export default BookingHeader;
