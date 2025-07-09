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
          roomUrl: `https://${config.daily.domain}/${appointment.consultation.dailyRoomName}`,
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

    res.status(201).json({
      success: true,
      data: {
        consultation,
        roomUrl: dailyRoom.url,
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
