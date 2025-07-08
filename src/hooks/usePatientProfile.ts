import { useQuery } from '@tanstack/react-query';
import { patientProfileService, PatientProfileData } from '@/lib/services/patientProfileService';
import { useAuth } from './useAuth';

/**
 * Hook to get patient profile data for booking
 */
export const usePatientBookingData = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['patient', 'booking-data'],
    queryFn: () => patientProfileService.getPatientBookingData(),
    enabled: isAuthenticated && user?.role === 'PATIENT',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to check onboarding status
 */
export const useOnboardingStatus = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['patient', 'onboarding-status'],
    queryFn: () => patientProfileService.getOnboardingStatus(),
    enabled: isAuthenticated && user?.role === 'PATIENT',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to check if user should see onboarding
 */
export const useShouldShowOnboarding = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['patient', 'should-show-onboarding'],
    queryFn: () => patientProfileService.shouldShowOnboarding(),
    enabled: isAuthenticated && user?.role === 'PATIENT',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook that combines profile data and completion status
 */
export const usePatientProfileForBooking = () => {
  const { data: patientData, isLoading: isLoadingProfile } = usePatientBookingData();
  const { data: onboardingStatus, isLoading: isLoadingOnboarding } = useOnboardingStatus();

  const isLoading = isLoadingProfile || isLoadingOnboarding;
  
  const isProfileComplete = patientData?.isProfileComplete || false;
  const hasCompletedOnboarding = onboardingStatus?.isCompleted || false;
  
  // User can skip personal info if they have a complete profile OR completed onboarding
  const canSkipPersonalInfo = isProfileComplete || hasCompletedOnboarding;
  
  // Get formatted data for forms
  const formData = patientData ? patientProfileService.formatForBookingForm(patientData) : null;

  return {
    patientData,
    onboardingStatus,
    formData,
    isLoading,
    isProfileComplete,
    hasCompletedOnboarding,
    canSkipPersonalInfo,
  };
};
