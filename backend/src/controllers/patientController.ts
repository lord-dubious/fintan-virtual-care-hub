import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

// Validation schemas
const dashboardQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  days: z.string().optional().transform(val => val ? parseInt(val) : 30),
});

/**
 * Get patient dashboard data
 * GET /api/patients/dashboard
 */
export const getPatientDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        error: 'Access denied. Patient role required.',
      });
      return;
    }

    // Validate query parameters
    const { limit, days } = dashboardQuerySchema.parse(req.query);

    logger.info(`📊 Getting dashboard data for patient: ${req.user.email}`);

    // Get patient record
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        emergencyContact: true,
        allergies: true,
        medications: true,
        medicalHistory: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
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

    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Get upcoming appointments (next 30 days)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        appointmentDate: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            consultationFee: true,
            user: {
              select: {
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
      take: limit,
    });

    // Get recent appointments (past 30 days)
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        appointmentDate: {
          gte: startDate,
          lt: new Date(),
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
      take: limit,
    });

    // Get recent activity (appointments, records, etc.)
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Get medical records
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        provider: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Calculate statistics
    const totalAppointments = await prisma.appointment.count({
      where: {
        patientId: patient.id,
      },
    });

    const completedAppointments = await prisma.appointment.count({
      where: {
        patientId: patient.id,
        status: 'COMPLETED',
      },
    });

    const cancelledAppointments = await prisma.appointment.count({
      where: {
        patientId: patient.id,
        status: 'CANCELLED',
      },
    });

    // Get next appointment
    const nextAppointment = upcomingAppointments[0] || null;

    // Prepare dashboard data
    const dashboardData = {
      patient: {
        id: patient.id,
        name: patient.user.name,
        email: patient.user.email,
        phone: patient.user.phone,
        profilePicture: patient.user.profilePicture,
        emergencyContact: patient.emergencyContact,
        allergies: patient.allergies,
        medications: patient.medications,
        medicalHistory: patient.medicalHistory,
      },
      upcomingAppointments: upcomingAppointments.map(appointment => ({
        id: appointment.id,
        date: appointment.appointmentDate,
        duration: appointment.duration,
        consultationType: appointment.consultationType,
        reason: appointment.reason,
        status: appointment.status,
        provider: {
          name: appointment.provider.user.name,
          specialization: appointment.provider.specialization,
          profilePicture: appointment.provider.user.profilePicture,
          consultationFee: appointment.provider.consultationFee,
        },
      })),
      recentAppointments: recentAppointments.map(appointment => ({
        id: appointment.id,
        date: appointment.appointmentDate,
        duration: appointment.duration,
        consultationType: appointment.consultationType,
        reason: appointment.reason,
        status: appointment.status,
        provider: {
          name: appointment.provider.user.name,
          specialization: appointment.provider.specialization,
        },
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })),
      medicalRecords: medicalRecords.map(record => ({
        id: record.id,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        prescription: record.prescription,
        notes: record.notes,
        createdAt: record.createdAt,
        provider: record.provider ? {
          name: record.provider.user.name,
        } : null,
      })),
      statistics: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalMedicalRecords: medicalRecords.length,
      },
      nextAppointment: nextAppointment ? {
        id: nextAppointment.id,
        date: nextAppointment.appointmentDate,
        provider: nextAppointment.provider.user.name,
        consultationType: nextAppointment.consultationType,
      } : null,
    };

    logger.info(`✅ Dashboard data retrieved for patient: ${patient.user.name}`);

    res.json({
      success: true,
      data: dashboardData,
      message: 'Patient dashboard data retrieved successfully',
    });
  } catch (error) {
    logger.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data',
    });
  }
};
