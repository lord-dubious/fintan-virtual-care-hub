import { z } from 'zod';

// Basic patient information schema
export const basicInfoSchema = z.object({
  dateOfBirth: z.string().transform((str) => new Date(str)),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER']).optional(),
});

// Emergency contact schema
export const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  relationship: z.enum(['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'FRIEND', 'OTHER']),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// Allergy schema
export const allergySchema = z.object({
  allergen: z.string().min(2, 'Allergen name is required'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  reaction: z.string().optional(),
  notes: z.string().optional(),
});

// Medication schema
export const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  prescriber: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Medical condition schema
export const conditionSchema = z.object({
  name: z.string().min(2, 'Condition name is required'),
  diagnosedDate: z.string().transform((str) => new Date(str)).optional(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'CHRONIC']).default('ACTIVE'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']).optional(),
  notes: z.string().optional(),
});



// Medical history schema
export const medicalHistorySchema = z.object({
  allergies: z.array(allergySchema).default([]),
  medications: z.array(medicationSchema).default([]),
  conditions: z.array(conditionSchema).default([]),
  familyHistory: z.string().optional(),
  surgicalHistory: z.string().optional(),
  socialHistory: z.object({
    smoking: z.enum(['NEVER', 'FORMER', 'CURRENT']).optional(),
    alcohol: z.enum(['NEVER', 'OCCASIONAL', 'REGULAR', 'HEAVY']).optional(),
    exercise: z.enum(['NONE', 'LIGHT', 'MODERATE', 'HEAVY']).optional(),
    diet: z.string().optional(),
  }).optional(),
});

// Preferences schema
export const preferencesSchema = z.object({
  preferredLanguage: z.string().default('en'),
  communicationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(true),
    phone: z.boolean().default(false),
    appointmentReminders: z.boolean().default(true),
    healthTips: z.boolean().default(false),
    promotions: z.boolean().default(false),
  }).optional(),
  accessibility: z.object({
    wheelchairAccess: z.boolean().default(false),
    hearingImpaired: z.boolean().default(false),
    visuallyImpaired: z.boolean().default(false),
    other: z.string().optional(),
  }).optional(),
});

// Consent schema
export const consentSchema = z.object({
  termsAndConditions: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
  hipaaAuthorization: z.boolean().refine(val => val === true, {
    message: 'HIPAA authorization is required',
  }),
  treatmentConsent: z.boolean().refine(val => val === true, {
    message: 'Treatment consent is required',
  }),
  communicationConsent: z.boolean().default(true),
  marketingConsent: z.boolean().default(false),
});

// Complete onboarding schema
export const completeOnboardingSchema = z.object({
  step: z.number().min(1).max(5),
  basicInfo: basicInfoSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  medicalHistory: medicalHistorySchema.optional(),
  preferences: preferencesSchema.optional(),
  consent: consentSchema.optional(),
});

// Step-by-step schemas for individual steps
export const onboardingStepSchemas = {
  1: z.object({ basicInfo: basicInfoSchema }),
  2: z.object({ emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required') }),
  3: z.object({ medicalHistory: medicalHistorySchema }),
  4: z.object({ preferences: preferencesSchema }),
  5: z.object({ consent: consentSchema }),
};

// Export types
export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
export type AllergyData = z.infer<typeof allergySchema>;
export type MedicationData = z.infer<typeof medicationSchema>;
export type ConditionData = z.infer<typeof conditionSchema>;
export type MedicalHistoryData = z.infer<typeof medicalHistorySchema>;
export type PreferencesData = z.infer<typeof preferencesSchema>;
export type ConsentData = z.infer<typeof consentSchema>;
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>;
