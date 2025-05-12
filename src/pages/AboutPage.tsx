import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const isMobile = useIsMobile();
  
  const medicineApproaches = [
    {
      title: "Conventional Medicine",
      points: [
        "Disease focused",
        "Treats symptoms using drugs, radiation or surgery",
        "Serves as knowledge base for Western medicine"
      ]
    },
    {
      title: "Alternative Medicine",
      points: [
        "Used in place of conventional medicine",
        "Treats symptoms using methods that are \"closer to nature\"",
        "Not all treatments are scientifically validated"
      ]
    },
    {
      title: "Complementary Medicine",
      points: [
        "Modern approach that uses both conventional & alternative medicines",
        "Diagnoses and treats symptoms with hybrid methods",
        "Combines best practices from multiple medical disciplines"
      ]
    },
    {
      title: "Integrative Medicine",
      points: [
        "Combines conventional and alternative medicines in a coordinated way",
        "Emphasis on data driven solutions",
        "Patient-focused and safety-oriented approach"
      ]
    },
    {
      title: "Functional Medicine",
      points: [
        "Questions the foundations of conventional medicine",
        "Treats the patient, not the disease",
        "Scientifically based in systems biology with focus on prevention"
      ]
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center dark:text-medical-dark-text-primary">
              About Dr. Ekochin Fintan
            </h1>
            
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-10">
              {/* Doctor's profile */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                <div className="w-40 h-40 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center overflow-hidden">
                  {/* Placeholder for doctor's image */}
                  <div className="text-5xl font-bold text-medical-primary dark:text-medical-accent">E</div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-semibold mb-2 dark:text-medical-dark-text-primary">Dr. Ekochin Fintan, MD</h2>
                  <p className="text-medical-primary dark:text-medical-accent font-medium mb-3">Neurologist & Integrative Medicine Specialist</p>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
                    Dr. Ekochin Fintan is one of two generations of the EKOCHIN Family of Doctors. He grew up in 
                    Nigeria with some years of childhood spent in Austria, where he added German to his Igbo and English 
                    language proficiency.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Neurology</span>
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Integrative Medicine</span>
                    <span className="px-3 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-sm rounded-full">Telemedicine</span>
                  </div>
                </div>
              </div>
              
              {/* Education & Credentials */}
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
              
              {/* Philosophy of Care */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Philosophy of Care</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-md border-l-4 border-medical-primary dark:border-medical-accent">
                  <p className="italic text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    "My medical practice is an amalgamation of Orthodox and Alternative medicine, yielding a blend of Complementary, Functional, Orthomolecular, and Lifestyle Medicine. This delivers a pharmacologically minimalist approach to healthcare. Most consultations end without a drug prescription, which makes for efficient cross-border client care."
                  </p>
                  <p className="mt-3 font-medium dark:text-medical-dark-text-primary">— Dr. Ekochin Fintan</p>
                </div>
              </div>
              
              {/* Professional Experience */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Professional Experience</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium dark:text-medical-dark-text-primary">Head of Neurology</p>
                    <p className="text-medical-primary dark:text-medical-accent">ESUT Teaching Hospital, Enugu</p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Leading the neurology department and providing specialized care to patients with neurological conditions.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium dark:text-medical-dark-text-primary">Senior Lecturer</p>
                    <p className="text-medical-primary dark:text-medical-accent">Godfrey Okoye University College of Medicine</p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Teaching Neurophysiology and training the next generation of medical professionals.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium dark:text-medical-dark-text-primary">Commissioner for Health</p>
                    <p className="text-medical-primary dark:text-medical-accent">Enugu State (2017-2019)</p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Served in public health leadership, overseeing healthcare policies and initiatives for the state.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium dark:text-medical-dark-text-primary">Consultant</p>
                    <p className="text-medical-primary dark:text-medical-accent">Regions Hospital Enugu in affiliation with Regions Neurosciences, Owerri</p>
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mt-1">
                      Providing specialized neurological consultations and care.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Medical Approaches */}
              <div>
                <h3 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Medical Approaches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicineApproaches.map((approach, index) => (
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
            </div>
            
            {/* CTA Section */}
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
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default AboutPage;
