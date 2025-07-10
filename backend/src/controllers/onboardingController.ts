import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import {
  onboardingStepSchemas
} from '@/schemas/onboardingSchemas';

/**
 * Start patient onboarding process
 * POST /api/patients/onboarding/start
 */
export const startOnboarding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PATIENT') {
      res.status(403).json({
        success: false,
        error: 'Only patients can start onboarding',
      });
      return;
    }

    // Check if patient profile exists
    let patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
    });

    if (!patient) {
      // Create patient profile
      patient = await prisma.patient.create({
        data: {
          userId: req.user.id,
          onboardingStatus: 'IN_PROGRESS',
          onboardingStep: 1,
        },
      });
    } else {
      // Update existing patient to start onboarding
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          onboardingStatus: 'IN_PROGRESS',
          onboardingStep: 1,
        },
      });
    }

    res.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          onboardingStatus: patient.onboardingStatus,
          currentStep: patient.onboardingStep,
          totalSteps: 6,
        },
      },
      message: 'Onboarding process started',
    });
  } catch (error) {
    logger.error('Start onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start onboarding',
    });
  }
};

/**
 * Submit onboarding step data
 * POST /api/patients/onboarding/step
 */
export const submitOnboardingStep = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PATIENT') {
      res.status(403).json({
        success: false,
        error: 'Only patients can submit onboarding data',
      });
      return;
    }

    const { step, ...stepData } = req.body;

    if (!step || step < 1 || step > 6) {
      res.status(400).json({
        success: false,
        error: 'Invalid step number. Must be between 1 and 6',
      });
      return;
    }

    // Validate step data
    const stepSchema = onboardingStepSchemas[step as keyof typeof onboardingStepSchemas];
    const validatedData = stepSchema.parse(stepData);

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient profile not found. Please start onboarding first.',
      });
      return;
    }

    // Process step data based on step number
    await processStepData(patient.id, step, validatedData);

    // Update patient onboarding progress
    const nextStep = step < 6 ? step + 1 : 6;
    const isCompleted = step === 6;

    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        onboardingStep: nextStep,
        onboardingStatus: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        consentGiven: isCompleted ? true : patient.consentGiven,
        consentDate: isCompleted ? new Date() : patient.consentDate,
      },
    });

    res.json({
      success: true,
      data: {
        patient: {
          id: updatedPatient.id,
          onboardingStatus: updatedPatient.onboardingStatus,
          currentStep: updatedPatient.onboardingStep,
          totalSteps: 6,
          isCompleted: updatedPatient.onboardingStatus === 'COMPLETED',
        },
      },
      message: isCompleted 
        ? 'Onboarding completed successfully!' 
        : `Step ${step} completed. Proceed to step ${nextStep}.`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
      });
      return;
    }

    logger.error('Submit onboarding step error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit onboarding step',
    });
  }
};

/**
 * Get onboarding status and progress
 * GET /api/patients/onboarding/status
 */
export const getOnboardingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PATIENT') {
      res.status(403).json({
        success: false,
        error: 'Only patients can view onboarding status',
      });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true,
        emergencyContacts: true,
      },
    });

    if (!patient) {
      res.json({
        success: true,
        data: {
          onboardingStatus: 'NOT_STARTED',
          currentStep: 0,
          totalSteps: 6,
          isCompleted: false,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        onboardingStatus: patient.onboardingStatus,
        currentStep: patient.onboardingStep,
        totalSteps: 6,
        isCompleted: patient.onboardingStatus === 'COMPLETED',
        consentGiven: patient.consentGiven,
        consentDate: patient.consentDate,
        completedData: {
          basicInfo: {
            dateOfBirth: patient.dateOfBirth,
            phone: patient.phone,
            address: patient.address,
          },
          emergencyContacts: patient.emergencyContact,
          allergies: (patient.medicalHistory as any)?.allergies || [],
          medications: (patient.medicalHistory as any)?.medications || [],
          conditions: (patient.medicalHistory as any)?.conditions || [],
          insurance: [],
          medicalHistory: patient.medicalHistory,
          preferences: patient.preferences,
        },
      },
    });
  } catch (error) {
    logger.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get onboarding status',
    });
  }
};

/**
 * Process step data and store in appropriate tables
 */
async function processStepData(patientId: string, step: number, data: any): Promise<void> {
  switch (step) {
    case 1: // Basic Info
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          dateOfBirth: data.basicInfo.dateOfBirth,
          phone: data.basicInfo.phone,
          address: data.basicInfo.address,
        },
      });
      break;

    case 2: // Emergency Contacts
      // Delete existing emergency contacts
      await prisma.emergencyContact.deleteMany({
        where: { patientId },
      });
      
      // Create new emergency contacts
      if (data.emergencyContacts?.length > 0) {
        await prisma.emergencyContact.createMany({
          data: data.emergencyContacts.map((contact: any) => ({
            ...contact,
            patientId,
          })),
        });
      }
      break;

    case 3: // Medical History
      const { allergies, medications, conditions, ...otherHistory } = data.medicalHistory;
      
      // Store structured medical history
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          medicalHistory: otherHistory,
        },
      });

      // Store allergies
      if (allergies?.length > 0) {
        await prisma.allergy.deleteMany({ where: { patientId } });
        await prisma.allergy.createMany({
          data: allergies.map((allergy: any) => ({ ...allergy, patientId })),
        });
      }

      // Store medications
      if (medications?.length > 0) {
        await prisma.medication.deleteMany({ where: { patientId } });
        await prisma.medication.createMany({
          data: medications.map((medication: any) => ({ ...medication, patientId })),
        });
      }

      // Store conditions
      if (conditions?.length > 0) {
        await prisma.condition.deleteMany({ where: { patientId } });
        await prisma.condition.createMany({
          data: conditions.map((condition: any) => ({ ...condition, patientId })),
        });
      }
      break;

    case 4: // Insurance
      // Update insurance information in patient record
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          insurance: data.insurance || [],
        },
      });
      break;

    case 5: // Preferences
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          preferences: data.preferences,
        },
      });
      break;

    case 6: // Consent
      // Consent is handled in the main function
      break;
  }
}

/**
 * Export patient data for compliance
 * GET /api/patients/onboarding/export
 */
export const exportPatientData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PATIENT') {
      res.status(403).json({
        success: false,
        error: 'Only patients can export their data',
      });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        emergencyContacts: true,
        allergies: true,
        medications: true,
        conditions: true,

        appointments: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            consultation: true,
            payment: true,
          },
        },
        medicalRecords: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },

      },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient profile not found',
      });
      return;
    }

    // Compile comprehensive patient data export
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: req.user.email,
        dataVersion: '1.0',
      },
      personalInformation: {
        user: patient.user,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
        phone: patient.phone,
        onboardingStatus: patient.onboardingStatus,
        consentGiven: patient.consentGiven,
        consentDate: patient.consentDate,
      },
      emergencyContacts: patient.emergencyContact,
      medicalInformation: {
        allergies: patient.allergies,
        medications: patient.medications,
        conditions: patient.conditions,
        medicalHistory: patient.medicalHistory,
      },
      insurance: patient.insurance,
      preferences: patient.preferences,
      appointments: patient.appointments.map(appointment => ({
        id: appointment.id,
        date: appointment.appointmentDate,
        reason: appointment.reason,
        status: appointment.status,
        consultationType: appointment.consultationType,
        provider: appointment.provider.user.name,
        consultation: appointment.consultation ? {
          status: appointment.consultation.status,
          notes: appointment.consultation.notes,
        } : null,
        payment: appointment.payment ? {
          amount: appointment.payment.amount,
          status: appointment.payment.status,
          paymentMethod: appointment.payment.paymentMethod,
        } : null,
      })),
      medicalRecords: patient.medicalRecords.map(record => ({
        id: record.id,
        date: record.createdAt,
        provider: record.provider.user.name,
        diagnosis: record.diagnosis,
        notes: record.notes,
        prescriptions: record.prescriptions,
      })),
      paymentHistory: patient.appointments
        .filter(appointment => appointment.payment)
        .map(appointment => ({
          id: appointment.payment!.id,
          date: appointment.payment!.createdAt,
          amount: appointment.payment!.amount,
          currency: appointment.payment!.currency,
          status: appointment.payment!.status,
          paymentMethod: appointment.payment!.paymentMethod,
        })),
    };

    res.json({
      success: true,
      data: exportData,
      message: 'Patient data exported successfully',
    });
  } catch (error) {
    logger.error('Export patient data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export patient data',
    });
  }
};
