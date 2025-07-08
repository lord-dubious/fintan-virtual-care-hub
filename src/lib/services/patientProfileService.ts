import { apiClient } from '../../api/client';
import { logger } from '../utils/monitoring';

export interface PatientProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  address: string | null;
  onboardingStatus: 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETED';
  onboardingStep: number;
  isProfileComplete: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface OnboardingStatus {
  onboardingStatus: 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETED';
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  consentGiven: boolean;
  consentDate: Date | null;
  completedData: {
    basicInfo: {
      dateOfBirth: Date | null;
      phone: string | null;
      address: string | null;
    };
    emergencyContacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    allergies: string[];
    medications: string[];
    conditions: string[];
    insurance: Record<string, unknown>[];
    medicalHistory: Record<string, unknown>;
    preferences: Record<string, unknown>;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  patient?: PatientData;
}

interface PatientData {
  id: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  onboardingStatus?: 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETED';
  onboardingStep?: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

class PatientProfileService {
  /**
   * Get current patient's profile data for booking
   */
  async getPatientBookingData(): Promise<PatientProfileData | null> {
    try {
      // Get user profile with patient data
      const profileResponse = await apiClient.get('/users/profile');

      if (!profileResponse.success || !profileResponse.data) {
        return null;
      }

      const userData = profileResponse.data as UserData;
      const patient = userData.patient;

      if (!patient) {
        return null; // User is not a patient
      }

      // Check if profile is complete enough for booking
      const isProfileComplete = this.isProfileCompleteForBooking(userData, patient);

      return {
        id: patient.id,
        userId: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || patient.phone || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
        address: patient.address || null,
        onboardingStatus: patient.onboardingStatus || 'INCOMPLETE',
        onboardingStep: patient.onboardingStep || 0,
        isProfileComplete,
        emergencyContact: patient.emergencyContact || undefined,
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error fetching patient booking data:', errorData);
      return null;
    }
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(): Promise<OnboardingStatus | null> {
    try {
      const response = await apiClient.get('/patients/onboarding/status');

      if (!response.success || !response.data) {
        return null;
      }

      return response.data as OnboardingStatus;
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error fetching onboarding status:', errorData);
      return null;
    }
  }

  /**
   * Check if patient profile is complete enough for booking
   */
  private isProfileCompleteForBooking(userData: UserData, patient: PatientData): boolean {
    // Required fields for booking
    const hasRequiredFields = !!(
      userData?.name &&
      userData?.email &&
      (userData?.phone || patient?.phone) &&
      patient?.dateOfBirth
    );

    // Check onboarding status
    const hasCompletedOnboarding = patient?.onboardingStatus === 'COMPLETED';

    // Profile is complete if it has required fields OR onboarding is completed
    return hasRequiredFields || hasCompletedOnboarding;
  }

  /**
   * Check if user needs to complete onboarding
   */
  async shouldShowOnboarding(): Promise<boolean> {
    try {
      const status = await this.getOnboardingStatus();
      
      if (!status) {
        return true; // Show onboarding if we can't get status
      }

      return status.onboardingStatus !== 'COMPLETED';
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error checking onboarding status:', errorData);
      return true;
    }
  }

  /**
   * Get formatted patient data for booking forms
   */
  formatForBookingForm(patientData: PatientProfileData) {
    return {
      patientName: patientData.name,
      patientEmail: patientData.email,
      patientPhone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      address: patientData.address,
      emergencyContact: patientData.emergencyContact,
    };
  }
}

export const patientProfileService = new PatientProfileService();
