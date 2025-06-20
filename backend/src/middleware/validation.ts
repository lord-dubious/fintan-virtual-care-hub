import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

// Generic validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: { errors },
        });
        return;
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  // Authentication schemas
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      role: z.enum(['PATIENT', 'PROVIDER', 'ADMIN']).optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().optional(),
      address: z.string().optional(),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),

  confirmResetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Reset token is required'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),

  // User schemas
  updateProfile: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      phone: z.string().optional(),
      avatar: z.string().url('Invalid avatar URL').optional(),
    }),
  }),

  // Patient schemas
  createPatient: z.object({
    body: z.object({
      userId: z.string().cuid('Invalid user ID'),
      dateOfBirth: z.string().datetime('Invalid date format').optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      emergencyContact: z.object({
        name: z.string().min(2, 'Emergency contact name is required'),
        phone: z.string().min(10, 'Valid phone number is required'),
        relationship: z.string().min(2, 'Relationship is required'),
      }).optional(),
      medicalHistory: z.object({
        conditions: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        surgeries: z.array(z.string()).optional(),
      }).optional(),
      insurance: z.object({
        provider: z.string().min(2, 'Insurance provider is required'),
        policyNumber: z.string().min(1, 'Policy number is required'),
        groupNumber: z.string().optional(),
      }).optional(),
    }),
  }),

  updatePatient: z.object({
    body: z.object({
      dateOfBirth: z.string().datetime('Invalid date format').optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      emergencyContact: z.object({
        name: z.string().min(2, 'Emergency contact name is required'),
        phone: z.string().min(10, 'Valid phone number is required'),
        relationship: z.string().min(2, 'Relationship is required'),
      }).optional(),
      medicalHistory: z.object({
        conditions: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        surgeries: z.array(z.string()).optional(),
      }).optional(),
      insurance: z.object({
        provider: z.string().min(2, 'Insurance provider is required'),
        policyNumber: z.string().min(1, 'Policy number is required'),
        groupNumber: z.string().optional(),
      }).optional(),
    }),
  }),

  // Provider schemas
  createProvider: z.object({
    body: z.object({
      userId: z.string().cuid('Invalid user ID'),
      specialization: z.string().optional(),
      bio: z.string().optional(),
      education: z.array(z.object({
        degree: z.string().min(2, 'Degree is required'),
        institution: z.string().min(2, 'Institution is required'),
        year: z.number().int().min(1900).max(new Date().getFullYear()),
      })).optional(),
      experience: z.array(z.object({
        position: z.string().min(2, 'Position is required'),
        organization: z.string().min(2, 'Organization is required'),
        startYear: z.number().int().min(1900).max(new Date().getFullYear()),
        endYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
      })).optional(),
      licenseNumber: z.string().optional(),
      consultationFee: z.number().positive('Consultation fee must be positive').optional(),
    }),
  }),

  // Appointment schemas
  createAppointment: z.object({
    body: z.object({
      patientId: z.string().cuid('Invalid patient ID'),
      providerId: z.string().cuid('Invalid provider ID'),
      appointmentDate: z.string().datetime('Invalid appointment date'),
      consultationType: z.enum(['VIDEO', 'AUDIO'], {
        errorMap: () => ({ message: 'Consultation type must be VIDEO or AUDIO' }),
      }),
      reason: z.string().optional(),
      duration: z.number().int().positive('Duration must be positive').optional(),
    }),
  }),

  updateAppointmentStatus: z.object({
    body: z.object({
      status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], {
        errorMap: () => ({ message: 'Invalid appointment status' }),
      }),
    }),
  }),

  rescheduleAppointment: z.object({
    body: z.object({
      newDate: z.string().datetime('Invalid appointment date'),
    }),
  }),

  // Consultation schemas
  createConsultation: z.object({
    body: z.object({
      appointmentId: z.string().cuid('Invalid appointment ID'),
      roomUrl: z.string().url('Invalid room URL'),
      videoEnabled: z.boolean().optional(),
      notes: z.string().optional(),
    }),
  }),

  updateConsultation: z.object({
    body: z.object({
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
        errorMap: () => ({ message: 'Invalid consultation status' }),
      }).optional(),
      notes: z.string().optional(),
    }),
  }),

  // Payment schemas
  createPayment: z.object({
    body: z.object({
      patientId: z.string().cuid('Invalid patient ID'),
      appointmentId: z.string().cuid('Invalid appointment ID').optional(),
      amount: z.number().positive('Amount must be positive'),
      currency: z.string().length(3, 'Currency must be 3 characters').optional(),
      paymentMethod: z.enum(['STRIPE', 'PAYSTACK', 'PAYPAL', 'FLUTTERWAVE'], {
        errorMap: () => ({ message: 'Invalid payment method' }),
      }),
      metadata: z.record(z.any()).optional(),
    }),
  }),

  // Medical Record schemas
  createMedicalRecord: z.object({
    body: z.object({
      patientId: z.string().cuid('Invalid patient ID'),
      providerId: z.string().cuid('Invalid provider ID'),
      consultationId: z.string().cuid('Invalid consultation ID').optional(),
      diagnosis: z.string().optional(),
      notes: z.string().optional(),
      prescriptions: z.array(z.object({
        medication: z.string().min(2, 'Medication name is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
        instructions: z.string().optional(),
      })).optional(),
    }),
  }),

  // Availability schemas
  updateAvailability: z.object({
    body: z.object({
      availability: z.array(z.object({
        dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], {
          errorMap: () => ({ message: 'Invalid day of week' }),
        }),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        isAvailable: z.boolean(),
      })),
    }),
  }),

  // Notification schemas
  createNotification: z.object({
    body: z.object({
      userId: z.string().cuid('Invalid user ID'),
      type: z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'PAYMENT_RECEIVED', 'CONSULTATION_READY', 'SYSTEM_NOTIFICATION'], {
        errorMap: () => ({ message: 'Invalid notification type' }),
      }),
      title: z.string().min(1, 'Title is required'),
      message: z.string().min(1, 'Message is required'),
      relatedId: z.string().optional(),
      link: z.string().url('Invalid link URL').optional(),
    }),
  }),

  // Query parameter schemas
  paginationQuery: z.object({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
      limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  }),

  appointmentFilters: z.object({
    query: z.object({
      status: z.string().optional(),
      consultationType: z.enum(['VIDEO', 'AUDIO']).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      patientId: z.string().cuid().optional(),
      providerId: z.string().cuid().optional(),
      page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
      limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    }),
  }),

  // ID parameter schemas
  idParam: z.object({
    params: z.object({
      id: z.string().cuid('Invalid ID format'),
    }),
  }),

  userIdParam: z.object({
    params: z.object({
      userId: z.string().cuid('Invalid user ID format'),
    }),
  }),

  patientIdParam: z.object({
    params: z.object({
      patientId: z.string().cuid('Invalid patient ID format'),
    }),
  }),

  providerIdParam: z.object({
    params: z.object({
      providerId: z.string().cuid('Invalid provider ID format'),
    }),
  }),

  appointmentIdParam: z.object({
    params: z.object({
      appointmentId: z.string().cuid('Invalid appointment ID format'),
    }),
  }),
};
