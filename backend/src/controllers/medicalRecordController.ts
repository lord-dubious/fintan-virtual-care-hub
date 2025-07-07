import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { z } from 'zod';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

// Validation schemas
const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const medicalRecordQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 10),
  patientId: z.string().optional(),
  providerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  diagnosis: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'followUpDate']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Create medical record
 * POST /api/medical-records
 */
export const createMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'DOCTOR') {
      res.status(403).json({
        success: false,
        error: 'Only healthcare providers can create medical records',
      });
      return;
    }

    const validatedData = createMedicalRecordSchema.parse(req.body);

    // Get provider ID
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
      return;
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
      select: { id: true, user: { select: { name: true } } },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found',
      });
      return;
    }

    // If appointment ID provided, verify it exists and belongs to this provider/patient
    if (validatedData.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: validatedData.appointmentId },
        select: { providerId: true, patientId: true },
      });

      if (!appointment || appointment.providerId !== provider.id || appointment.patientId !== validatedData.patientId) {
        res.status(400).json({
          success: false,
          error: 'Invalid appointment reference',
        });
        return;
      }
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        ...validatedData,
        providerId: provider.id,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
      },
      include: {
        patient: {
          select: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        provider: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            consultationType: true,
          },
        },
      },
    });

    logger.info(`✅ Medical record created: ${medicalRecord.id} for patient ${patient.user.name}`);

    res.status(201).json({
      success: true,
      data: { medicalRecord },
      message: 'Medical record created successfully',
    });
  } catch (error) {
    logger.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create medical record',
    });
  }
};

/**
 * Get medical records with filtering and pagination
 * GET /api/medical-records
 */
export const getMedicalRecords = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const queryParams = medicalRecordQuerySchema.parse(req.query);
    const { page, limit, patientId, providerId, dateFrom, dateTo, diagnosis, sortBy, sortOrder } = queryParams;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based access control
    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!patient) {
        res.status(404).json({
          success: false,
          error: 'Patient profile not found',
        });
        return;
      }

      where.patientId = patient.id;
    } else if (req.user.role === 'PROVIDER' || req.user.role === 'DOCTOR') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Provider profile not found',
        });
        return;
      }

      where.providerId = provider.id;

      // Providers can filter by patient if specified
      if (patientId) {
        where.patientId = patientId;
      }
    } else if (req.user.role === 'ADMIN') {
      // Admins can filter by both
      if (patientId) where.patientId = patientId;
      if (providerId) where.providerId = providerId;
    }

    // Additional filters
    if (diagnosis) {
      where.diagnosis = { contains: diagnosis, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = startOfDay(parseISO(dateFrom));
      if (dateTo) where.createdAt.lte = endOfDay(parseISO(dateTo));
    }

    const [medicalRecords, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          patient: {
            select: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          provider: {
            select: {
              user: {
                select: { name: true },
              },
              specialization: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              consultationType: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        medicalRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        filters: { patientId, providerId, dateFrom, dateTo, diagnosis, sortBy, sortOrder },
      },
      message: `Retrieved ${medicalRecords.length} medical records`,
    });
  } catch (error) {
    logger.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve medical records',
    });
  }
};

/**
 * Get specific medical record
 * GET /api/medical-records/:id
 */
export const getMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        provider: {
          select: {
            user: {
              select: { name: true },
            },
            specialization: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            consultationType: true,
            duration: true,
          },
        },
      },
    });

    if (!medicalRecord) {
      res.status(404).json({
        success: false,
        error: 'Medical record not found',
      });
      return;
    }

    // Access control
    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!patient || medicalRecord.patientId !== patient.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }
    } else if (req.user.role === 'PROVIDER' || req.user.role === 'DOCTOR') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider || medicalRecord.providerId !== provider.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }
    }
    // Admins can access all records

    res.json({
      success: true,
      data: { medicalRecord },
      message: 'Medical record retrieved successfully',
    });
  } catch (error) {
    logger.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve medical record',
    });
  }
};

/**
 * Update medical record
 * PUT /api/medical-records/:id
 */
export const updateMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'DOCTOR') {
      res.status(403).json({
        success: false,
        error: 'Only healthcare providers can update medical records',
      });
      return;
    }

    const { id } = req.params;
    const validatedData = updateMedicalRecordSchema.parse(req.body);

    // Get provider ID
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
      return;
    }

    // Check if record exists and belongs to this provider
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      select: { providerId: true },
    });

    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: 'Medical record not found',
      });
      return;
    }

    if (existingRecord.providerId !== provider.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        provider: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    logger.info(`✅ Medical record updated: ${id}`);

    res.json({
      success: true,
      data: { medicalRecord: updatedRecord },
      message: 'Medical record updated successfully',
    });
  } catch (error) {
    logger.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update medical record',
    });
  }
};

/**
 * Delete medical record
 * DELETE /api/medical-records/:id
 */
export const deleteMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    const { id } = req.params;

    // Check if record exists
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      select: {
        providerId: true,
        patient: {
          select: {
            user: { select: { name: true } }
          }
        }
      },
    });

    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: 'Medical record not found',
      });
      return;
    }

    // Access control for providers
    if (req.user.role === 'PROVIDER' || req.user.role === 'DOCTOR') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider || existingRecord.providerId !== provider.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }
    }

    await prisma.medicalRecord.delete({
      where: { id },
    });

    logger.info(`✅ Medical record deleted: ${id} for patient ${existingRecord.patient.user.name}`);

    res.json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    logger.error('Delete medical record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete medical record',
    });
  }
};
