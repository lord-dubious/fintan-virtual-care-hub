import React from "react";

import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Ready to Experience a Different Approach to Healthcare?</h3>
      <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-6">
        Whether you're seeking a second opinion or looking for effective natural medical advice, 
        Dr. Ekochin's integrative approach might be what you need.
      </p>
      <Link to="/booking">
        <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
          Book a Consultation
        </Button>
      </Link>
    </div>
  );
};

export default CtaSection;
