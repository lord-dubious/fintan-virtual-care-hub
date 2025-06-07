
import React from 'react';

const PhilosophySection: React.FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">
        What to expect from a virtual consultation with Dr. Fintan
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center">
          <div className="mb-2">📋</div>
          <h4 className="font-medium text-sm mb-2">Evidence-Based Medicine</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Using scientifically proven treatments and diagnostic methods for optimal outcomes.
          </p>
        </div>
        
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
          <div className="mb-2">🌿</div>
          <h4 className="font-medium text-sm mb-2">Functional Medicine</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Treating symptoms and identifying root causes through comprehensive patient assessment.
          </p>
        </div>
        
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg text-center">
          <div className="mb-2">🧘</div>
          <h4 className="font-medium text-sm mb-2">Integrative Medicine</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Combining conventional and complementary therapies for holistic healing.
          </p>
        </div>
        
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-center">
          <div className="mb-2">❤️</div>
          <h4 className="font-medium text-sm mb-2">Cardiovascular Medicine</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Specialized expertise in heart health and vascular conditions.
          </p>
        </div>
        
        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg text-center">
          <div className="mb-2">⚗️</div>
          <h4 className="font-medium text-sm mb-2">Nutritional Medicine</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Optimizing health through targeted nutrition and dietary interventions.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
        <p>
          Dr. Fintan's medical practice is an amalgamation of Orthodox and Alternative medicines - balancing the efficiency of Modern Allopathic Medicine, Complementary, Functional, Orthomolecular as well as Nutritional Medicine. He keeps an eye for safety in the application of treatment.
        </p>
        <p>
          Most consultations end without a drug prescription, which makes for efficient cross border client service. When patients need a drug of choice they are referred to their local physician. So may you be search of a second opinion for a medical consultation? Or do you just want to get early and effective standard medical advice at affordable cost?
        </p>
        <p>
          Do you want to know the connection between Nutrition and your Health?
        </p>
        <p>
          Are you in search of alternative treatment medical advice from a trained conventional doctor but one who appreciates the enormous evidence in Natural medicine? Do you find your Health-care expensive?
        </p>
        <p>
          Are you inclined to look for alternative ideas with your illnesses or just want to understand the effects of a particular diagnosis and how to heal your Health?
        </p>
        <p>
          Then you have come to the right place. Welcome!
        </p>
        <h4 className="text-lg font-semibold text-medical-primary dark:text-medical-accent">
          Ready to GO! Book your Teleconsultation.
        </h4>
        <p>
          Video or Audio only consultations are available via WhatsApp, Instagram, Google Meet and Zoom.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 rounded text-white flex items-center justify-center text-sm">📱</div>
          <p className="text-xs font-medium">WhatsApp</p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded text-white flex items-center justify-center text-sm">💬</div>
          <p className="text-xs font-medium">Instagram</p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="w-8 h-8 mx-auto mb-2 bg-red-500 rounded text-white flex items-center justify-center text-sm">📹</div>
          <p className="text-xs font-medium">Google Meet</p>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded text-white flex items-center justify-center text-sm">🎥</div>
          <p className="text-xs font-medium">Zoom</p>
        </div>
      </div>

      <div className="mt-6 bg-medical-primary/5 dark:bg-medical-accent/10 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Booking Process:</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Step One:</strong> Pick date and time and submit a short note succinctly conveying your medical challenge(s) and your expected solution. This is necessary for determining Video or Audio only consultation type.</p>
          <p><strong>Step Two:</strong> Make payment using any convenient option as displayed.</p>
          <p><strong>Step Three:</strong> Get a confirmation of payment and a link for the Teleconsultation.</p>
          <p><strong>Step Four:</strong> Logon Call as far the Consultation and ensure to share all relevant investigations and medication information.</p>
        </div>
        <p className="text-xs mt-4 font-medium">
          Expecting you and assuring you of feeling the Consultation better than before!
        </p>
      </div>
    </div>
  );
};

export default PhilosophySection;
