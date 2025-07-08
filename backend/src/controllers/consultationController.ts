import { Response } from 'express';
import { prisma } from '@/config/database';
import { dailyClient } from '@/config/daily';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { config } from '@/config';

/**
 * Create consultation room for appointment
 * POST /api/consultations/room
 */
export const createConsultationRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Fetch appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true }
        },
        provider: {
          include: { user: true }
        },
        consultation: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization - only provider, patient, or admin can create room
    const isPatient = req.user.role === 'PATIENT' && appointment.patient.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if consultation room already exists
    if (appointment.consultation?.dailyRoomId) {
      res.status(200).json({
        success: true,
        data: {
          consultation: appointment.consultation,
          roomUrl: process.env.DAILY_CO_BASE_URL
            ? `${process.env.DAILY_CO_BASE_URL}/${appointment.consultation.dailyRoomName}`
            : `https://${config.daily.domain}/${appointment.consultation.dailyRoomName}`,
        },
        message: 'Consultation room already exists',
      });
      return;
    }

    // Create Daily.co room
    const roomName = `appointment-${appointmentId}`;
    const roomDurationMinutes = 60; // Default 1 hour
    const roomExpirationTime = Math.floor(Date.now() / 1000) + (roomDurationMinutes * 60);

    const roomProperties = {
      name: roomName,
      privacy: 'private',
      exp: roomExpirationTime,
      enable_prejoin_ui: true,
      eject_at_room_expiration: true,
      enable_chat: true,
      enable_screenshare: true,
      start_video_off: true,
      start_audio_off: true,
      enable_recording: 'cloud',
    };

    const dailyRoom = await dailyClient.createRoom(roomProperties);

    // Create or update consultation record
    const consultation = await prisma.consultation.upsert({
      where: { appointmentId },
      update: {
        dailyRoomId: dailyRoom.id,
        dailyRoomName: dailyRoom.name,
        roomUrl: dailyRoom.url,
        status: 'SCHEDULED',
      },
      create: {
        appointmentId,
        dailyRoomId: dailyRoom.id,
        dailyRoomName: dailyRoom.name,
        roomUrl: dailyRoom.url,
        status: 'SCHEDULED',
      },
    });

    // Use environment-configured URL or fallback to Daily.co response
    const roomUrl = process.env.DAILY_CO_BASE_URL
      ? `${process.env.DAILY_CO_BASE_URL}/${roomName}`
      : dailyRoom.url;

    res.status(201).json({
      success: true,
      data: {
        consultation,
        roomUrl,
        expiresAt: new Date(dailyRoom.exp * 1000),
      },
      message: 'Consultation room created successfully',
    });
  } catch (error) {
    logger.error('Create consultation room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create consultation room',
    });
  }
};

/**
 * Generate consultation token for participant
 * GET /api/consultations/:appointmentId/token
 */
export const generateConsultationToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId } = req.params;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Fetch appointment and consultation details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true }
        },
        provider: {
          include: { user: true }
        },
        consultation: true,
      },
    });

    if (!appointment || !appointment.consultation?.dailyRoomName) {
      res.status(404).json({
        success: false,
        error: 'Appointment or consultation room not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Generate user name for the call
    const userName = isPatient 
      ? appointment.patient.user.name 
      : isProvider 
        ? appointment.provider.user.name 
        : 'Admin';

    // Define token properties based on user role
    const tokenProperties: any = {
      room_name: appointment.consultation.dailyRoomName,
      user_name: userName,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
      enable_prejoin_ui: true,
      start_video_off: true,
      start_audio_off: true,
    };

    if (isProvider || isAdmin) {
      tokenProperties.is_owner = true;
      tokenProperties.enable_screenshare = true;
      tokenProperties.enable_recording = 'cloud';
    } else if (isPatient) {
      tokenProperties.is_owner = false;
      tokenProperties.enable_screenshare = false;
      tokenProperties.enable_recording = false;
      tokenProperties.can_send_chat = true;
    }

    // Generate Daily.co token
    const tokenResponse = await dailyClient.createMeetingToken(tokenProperties);

    res.status(200).json({
      success: true,
      data: {
        token: tokenResponse.token,
        roomUrl: appointment.consultation.roomUrl,
        userName,
        isOwner: tokenProperties.is_owner,
        expiresAt: new Date(tokenResponse.exp * 1000),
      },
      message: 'Consultation token generated successfully',
    });
  } catch (error) {
    logger.error('Generate consultation token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate consultation token',
    });
  }
};

/**
 * Get consultation details
 * GET /api/consultations/:appointmentId
 */
export const getConsultation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId } = req.params;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true }
        },
        provider: {
          include: { user: true }
        },
        consultation: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        appointment,
        consultation: appointment.consultation,
      },
    });
  } catch (error) {
    logger.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consultation',
    });
  }
};

/**
 * Join consultation and get room URL/token
 * POST /api/consultations/:appointmentId/join
 */
export const joinConsultation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId } = req.params;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Fetch appointment and consultation details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true }
        },
        provider: {
          include: { user: true }
        },
        consultation: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    let consultation = appointment.consultation;

    // Create consultation if it doesn't exist
    if (!consultation) {
      const roomProperties = {
        name: `consultation-${appointmentId}-${Date.now()}`,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        enable_screenshare: true,
        enable_chat: true,
        start_video_off: appointment.consultationType === 'AUDIO',
        start_audio_off: false,
        eject_at_room_exp: true,
        eject_after_elapsed: 3600, // 1 hour max
      };

      const dailyRoom = await dailyClient.createRoom(roomProperties);

      consultation = await prisma.consultation.create({
        data: {
          appointmentId,
          dailyRoomId: dailyRoom.id,
          dailyRoomName: dailyRoom.name,
          roomUrl: dailyRoom.url,
          status: 'SCHEDULED',
        },
      });
    }

    // Generate token for participant
    const tokenProperties = {
      room_name: consultation.dailyRoomName,
      user_name: req.user.name,
      is_owner: req.user.role === 'PROVIDER',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    const tokenResponse = await dailyClient.createMeetingToken(tokenProperties);
    const token = tokenResponse.token;

    res.json({
      success: true,
      data: {
        roomUrl: consultation.roomUrl,
        token,
        consultation,
      },
    });
  } catch (error) {
    logger.error('Join consultation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join consultation',
    });
  }
};

/**
 * Create a new consultation
 * POST /api/consultations/create/:appointmentId
 */
export const createConsultation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId } = req.params;
    const { videoEnabled = true } = req.body;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        provider: { include: { user: true } },
        consultation: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Return existing consultation if it exists
    if (appointment.consultation) {
      res.json({
        success: true,
        data: appointment.consultation,
        message: 'Consultation already exists',
      });
      return;
    }

    // Create Daily.co room
    const roomProperties = {
      name: `consultation-${appointmentId}-${Date.now()}`,
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      enable_screenshare: true,
      enable_chat: true,
      start_video_off: !videoEnabled || appointment.consultationType === 'AUDIO',
      start_audio_off: false,
      eject_at_room_exp: true,
      eject_after_elapsed: 3600, // 1 hour max
    };

    const dailyRoom = await dailyClient.createRoom(roomProperties);

    // Create consultation record
    const consultation = await prisma.consultation.create({
      data: {
        appointmentId,
        dailyRoomId: dailyRoom.id,
        dailyRoomName: dailyRoom.name,
        roomUrl: dailyRoom.url,
        status: 'SCHEDULED',
        videoEnabled,
      },
    });

    res.status(201).json({
      success: true,
      data: consultation,
      message: 'Consultation created successfully',
    });
  } catch (error) {
    logger.error('Create consultation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create consultation',
    });
  }
};

/**
 * Update consultation notes
 * PUT /api/consultations/:consultationId/notes
 */
export const updateConsultationNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { consultationId } = req.params;
    const { notes } = req.body;

    if (!consultationId) {
      res.status(400).json({
        success: false,
        error: 'Consultation ID is required',
      });
      return;
    }

    if (typeof notes !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Notes must be a string',
      });
      return;
    }

    // Find consultation with appointment details
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            provider: { include: { user: true } },
          },
        },
      },
    });

    if (!consultation) {
      res.status(404).json({
        success: false,
        error: 'Consultation not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && consultation.appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && consultation.appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Update consultation notes
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: { notes },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            provider: { include: { user: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedConsultation,
      message: 'Consultation notes updated successfully',
    });
  } catch (error) {
    logger.error('Update consultation notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update consultation notes',
    });
  }
};

/**
 * Update consultation status
 * PUT /api/consultations/:consultationId/status
 */
export const updateConsultationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { consultationId } = req.params;
    const { status } = req.body;

    if (!consultationId) {
      res.status(400).json({
        success: false,
        error: 'Consultation ID is required',
      });
      return;
    }

    const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    // Find consultation with appointment details
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            provider: { include: { user: true } },
          },
        },
      },
    });

    if (!consultation) {
      res.status(404).json({
        success: false,
        error: 'Consultation not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && consultation.appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && consultation.appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Update consultation status
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: { status },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            provider: { include: { user: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedConsultation,
      message: 'Consultation status updated successfully',
    });
  } catch (error) {
    logger.error('Update consultation status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update consultation status',
    });
  }
};
