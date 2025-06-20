import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

/**
 * Get user profile with role-specific data
 * GET /api/users/profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get user with role-specific data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            dateOfBirth: true,
            address: true,
            phone: true,
            emergencyContact: true,
            medicalHistory: true,
            insurance: true,
            preferences: true,
          },
        },
        provider: {
          select: {
            id: true,
            specialization: true,
            bio: true,
            education: true,
            experience: true,
            licenseNumber: true,
            isVerified: true,
            isActive: true,
            consultationFee: true,
            availability: {
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { name, phone } = req.body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
};

/**
 * Update patient profile
 * PUT /api/users/patient-profile
 */
export const updatePatientProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { dateOfBirth, address, emergencyContact, medicalHistory, insurance, preferences } = req.body;

    // Update or create patient profile
    const updateData: any = {
      address,
      phone: req.user.phone,
      emergencyContact,
      medicalHistory,
      insurance,
      preferences,
    };

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    const patientProfile = await prisma.patient.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: {
        userId: req.user.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        phone: req.user.phone,
        emergencyContact,
        medicalHistory,
        insurance,
        preferences,
      },
      select: {
        id: true,
        dateOfBirth: true,
        address: true,
        phone: true,
        emergencyContact: true,
        medicalHistory: true,
        insurance: true,
        preferences: true,
      },
    });

    res.json({
      success: true,
      data: { patientProfile },
      message: 'Patient profile updated successfully',
    });
  } catch (error) {
    logger.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update patient profile',
    });
  }
};

/**
 * Update provider profile
 * PUT /api/users/provider-profile
 */
export const updateProviderProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PROVIDER') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Provider role required.',
      });
      return;
    }

    const {
      specialization,
      bio,
      education,
      experience,
      licenseNumber,
      consultationFee
    } = req.body;

    // Update provider profile
    const updateData: any = {
      specialization,
      bio,
      education,
      experience,
      licenseNumber,
    };

    if (consultationFee !== undefined) {
      updateData.consultationFee = parseFloat(consultationFee);
    }

    const providerProfile = await prisma.provider.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: {
        userId: req.user.id,
        specialization,
        bio,
        education,
        experience,
        licenseNumber,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        isVerified: false,
        isActive: false,
      },
      select: {
        id: true,
        specialization: true,
        bio: true,
        education: true,
        experience: true,
        licenseNumber: true,
        isVerified: true,
        isActive: true,
        consultationFee: true,
      },
    });

    res.json({
      success: true,
      data: { providerProfile },
      message: 'Provider profile updated successfully',
    });
  } catch (error) {
    logger.error('Update provider profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update provider profile',
    });
  }
};

/**
 * Get all providers (for patient to browse)
 * GET /api/users/providers
 */
export const getProviders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { specialization, isActive = 'true', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isVerified: true,
      isActive: isActive === 'true',
    };

    if (specialization) {
      where.specialization = {
        contains: specialization as string,
        mode: 'insensitive',
      };
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        select: {
          id: true,
          specialization: true,
          bio: true,
          consultationFee: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          availability: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              isAvailable: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          user: {
            name: 'asc',
          },
        },
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get providers',
    });
  }
};

/**
 * Update provider availability
 * PUT /api/users/provider-availability
 */
export const updateProviderAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PROVIDER') {
      res.status(403).json({
        success: false,
        error: 'Only providers can update availability',
      });
      return;
    }

    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      res.status(400).json({
        success: false,
        error: 'Availability array is required',
      });
      return;
    }

    // Validate availability format
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    for (const slot of availability) {
      if (!validDays.includes(slot.dayOfWeek)) {
        res.status(400).json({
          success: false,
          error: `Invalid day of week: ${slot.dayOfWeek}`,
        });
        return;
      }

      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        res.status(400).json({
          success: false,
          error: 'Invalid time format. Use HH:MM format',
        });
        return;
      }

      // Check if start time is before end time
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        res.status(400).json({
          success: false,
          error: 'Start time must be before end time',
        });
        return;
      }
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.id },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
      return;
    }

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { providerId: provider.id },
    });

    // Create new availability slots
    const availabilityData = availability.map((slot: any) => ({
      providerId: provider.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable !== false, // Default to true
    }));

    await prisma.availability.createMany({
      data: availabilityData,
    });

    // Get updated availability
    const updatedAvailability = await prisma.availability.findMany({
      where: { providerId: provider.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: { availability: updatedAvailability },
      message: 'Provider availability updated successfully',
    });
  } catch (error) {
    logger.error('Update provider availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update provider availability',
    });
  }
};

/**
 * Get provider availability
 * GET /api/users/provider-availability
 */
export const getProviderAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { providerId } = req.query;

    let targetProviderId: string;

    if (providerId) {
      // Getting availability for a specific provider (for patients/admins)
      targetProviderId = providerId as string;
    } else if (req.user.role === 'PROVIDER') {
      // Provider getting their own availability
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

      targetProviderId = provider.id;
    } else {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    const availability = await prisma.availability.findMany({
      where: { providerId: targetProviderId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: { availability },
    });
  } catch (error) {
    logger.error('Get provider availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get provider availability',
    });
  }
};
