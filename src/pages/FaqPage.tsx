
// import React from 'react'; // Not needed with modern React
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqPage = () => {
  const isMobile = useIsMobile();

  const faqs = [
    {
      question: "How do virtual consultations work?",
      answer: "Virtual consultations take place via a secure video or audio connection. After booking, you'll receive a link to join the consultation at your scheduled time. You'll connect with Dr. Fintan directly from your device (computer, tablet, or smartphone) without needing to download any special software."
    },
    {
      question: "What conditions can be treated virtually?",
      answer: "Many common conditions can be effectively assessed and treated through virtual consultations, including cold and flu symptoms, allergies, skin conditions (rashes, acne), minor infections, digestive issues, mental health concerns (anxiety, depression), and chronic disease management for established patients. Some conditions may require in-person examination, in which case Dr. Fintan will refer you appropriately."
    },
    {
      question: "Can Dr. Fintan prescribe medications during a virtual consultation?",
      answer: "Yes, Dr. Fintan can prescribe many medications during a virtual consultation if medically appropriate. Prescriptions will be sent electronically to your preferred pharmacy. However, there are some limitations on prescribing controlled substances via telemedicine due to regulatory requirements."
    },
    {
      question: "How much does a consultation cost?",
      answer: "Video consultations cost $85 for a 30-minute session, while audio-only consultations cost $65 for a 30-minute session. We accept major credit/debit cards and PayPal. Some insurance plans may cover telemedicine services - check with your provider or contact us for assistance."
    },
    {
      question: "How do I prepare for a virtual consultation?",
      answer: "To prepare for your consultation: 1) Find a quiet, private space with good internet connection. 2) Test your device's camera and microphone beforehand. 3) Have a list of your symptoms, concerns, and any medications you're taking. 4) If relevant, have a flashlight for better visibility of symptoms. 5) Join the consultation a few minutes early to ensure everything is working properly."
    },
    {
      question: "Is my personal and medical information secure?",
      answer: "Yes, we take your privacy very seriously. Our virtual consultation platform is fully HIPAA-compliant with end-to-end encryption. Your personal and medical information is protected according to strict privacy standards."
    },
    {
      question: "What if I need to cancel or reschedule my appointment?",
      answer: "You can cancel or reschedule your appointment up to 24 hours before your scheduled time without any charge. Changes made within 24 hours of your appointment may be subject to a fee. To reschedule, please log in to your account or contact our support team."
    },
    {
      question: "What should I do in case of a medical emergency?",
      answer: "Virtual consultations are not appropriate for medical emergencies. If you are experiencing severe chest pain, difficulty breathing, severe bleeding, or other emergency symptoms, please call emergency services (911) or go to your nearest emergency room immediately."
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
              Frequently Asked Questions
            </h1>
            <p className="text-center text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-10">
              Find answers to common questions about Dr. Fintan's virtual consultation services.
            </p>
            
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-10">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium dark:text-medical-dark-text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            {/* Still Have Questions Section */}
            <div className="bg-medical-primary/10 dark:bg-medical-accent/20 p-6 rounded-lg text-center">
              <h2 className="text-xl font-semibold mb-3 dark:text-medical-dark-text-primary">Still Have Questions?</h2>
              <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
                We're here to help. Contact us directly for any additional questions or concerns.
              </p>
              <Link to="/contact">
                <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default FaqPage;
