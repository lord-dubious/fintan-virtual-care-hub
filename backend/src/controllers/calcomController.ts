import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { calcomConfig, WebhookEventType } from '@/config/calcom';
import { calcomService } from '@/services/calcomService';
import { dailyClient } from '@/config/daily';

// Cal.com webhook payload interface
interface CalcomWebhookPayload {
  triggerEvent: WebhookEventType;
  createdAt: string;
  payload: {
    type: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    organizer: {
      id: number;
      name: string;
      email: string;
      username: string;
      timeZone: string;
    };
    attendees: Array<{
      email: string;
      name: string;
      timeZone: string;
    }>;
    location: string;
    uid: string;
    bookingId: number;
    eventTypeId: number;
    status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
    metadata: Record<string, any>;
    rescheduleUid?: string;
    cancellationReason?: string;
  };
}

/**
 * Verify Cal.com webhook signature
 */
const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  if (!calcomConfig.webhookSecret) {
    logger.warn('Webhook secret not configured, skipping signature verification');
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', calcomConfig.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Handle Cal.com webhook events
 * POST /api/calcom/webhooks
 */
export const handleCalcomWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-cal-signature'] as string;

    // Check for missing webhook signature header
    if (!signature) {
      res.status(400).json({
        success: false,
        error: 'Missing webhook signature header'
      });
      return;
    }

    // Use raw body for signature verification (should be captured by middleware)
    const payload = req.rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      logger.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const webhookData: CalcomWebhookPayload = req.body;
    logger.info('Received Cal.com webhook:', {
      event: webhookData.triggerEvent,
      bookingId: webhookData.payload.bookingId,
    });

    // Process webhook based on event type
    switch (webhookData.triggerEvent) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(webhookData.payload);
        break;
      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(webhookData.payload);
        break;
      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(webhookData.payload);
        break;
      case 'BOOKING_CONFIRMED':
        await handleBookingConfirmed(webhookData.payload);
        break;
      case 'MEETING_STARTED':
        await handleMeetingStarted(webhookData.payload);
        break;
      case 'MEETING_ENDED':
        await handleMeetingEnded(webhookData.payload);
        break;
      default:
        logger.info('Unhandled webhook event:', webhookData.triggerEvent);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling Cal.com webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handle booking created event
 */
const handleBookingCreated = async (payload: CalcomWebhookPayload['payload']): Promise<void> => {
  try {
    // Find the user in our system - prioritize attendee email for patient bookings
    const attendeeEmail = payload.attendees[0]?.email;
    const organizerId = payload.organizer.id;

    let user = null;

    // First try to find by attendee email (most likely the patient)
    if (attendeeEmail) {
      user = await prisma.user.findFirst({
        where: { email: attendeeEmail },
        include: {
          patient: true,
          provider: true,
        },
      });
    }

    // If not found and we have organizer ID, try that
    if (!user && organizerId) {
      user = await prisma.user.findFirst({
        where: { calcomUserId: organizerId },
        include: {
          patient: true,
          provider: true,
        },
      });
    }

    if (!user) {
      logger.error('User not found for Cal.com booking:', { attendeeEmail, organizerId });
      return;
    }

    // Ensure we have a patient for appointment creation
    if (!user.patient) {
      logger.error('User found but no patient record exists:', user.id);
      return;
    }

    // Determine consultation type from event type or metadata
    const consultationType = payload.metadata?.consultationType || 
      (payload.type.toLowerCase().includes('audio') ? 'AUDIO' : 'VIDEO');

    // Get provider - either from user or default
    const providerId = user.provider?.id || await getDefaultProviderId();
    if (!providerId) {
      logger.error('No provider available for booking');
      return;
    }

    // Create appointment in our system
    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.patient.id,
        providerId: providerId,
        appointmentDate: new Date(payload.startTime),
        reason: payload.description || 'Consultation',
        duration: Math.round((new Date(payload.endTime).getTime() - new Date(payload.startTime).getTime()) / 60000),
        notes: payload.title,
        timezone: payload.attendees[0]?.timeZone || 'UTC',
        consultationType: consultationType as 'VIDEO' | 'AUDIO',
        status: 'SCHEDULED',
        // Cal.com specific fields
        calcomBookingId: payload.bookingId,
        calcomBookingUid: payload.uid,
        calcomEventTypeId: payload.eventTypeId,
      },
    });

    // Create consultation record with Daily.co room
    if (calcomConfig.enableDailyIntegration) {
      await createConsultationWithDailyRoom(appointment.id, consultationType as 'VIDEO' | 'AUDIO');
    }

    logger.info('Created appointment from Cal.com booking:', {
      appointmentId: appointment.id,
      calcomBookingId: payload.bookingId,
    });
  } catch (error) {
    logger.error('Error handling booking created:', error);
    throw error;
  }
};

/**
 * Handle booking rescheduled event
 */
const handleBookingRescheduled = async (payload: CalcomWebhookPayload['payload']): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { calcomBookingId: payload.bookingId },
          { calcomBookingUid: payload.uid },
        ],
      },
    });

    if (!appointment) {
      logger.error('Appointment not found for Cal.com booking:', payload.bookingId);
      return;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        appointmentDate: new Date(payload.startTime),
        duration: Math.round((new Date(payload.endTime).getTime() - new Date(payload.startTime).getTime()) / 60000),
        notes: `${appointment.notes || ''}\n[Rescheduled] ${payload.title}`,
        updatedAt: new Date(),
      },
    });

    logger.info('Updated appointment from Cal.com reschedule:', {
      appointmentId: appointment.id,
      calcomBookingId: payload.bookingId,
    });
  } catch (error) {
    logger.error('Error handling booking rescheduled:', error);
    throw error;
  }
};

/**
 * Handle booking cancelled event
 */
const handleBookingCancelled = async (payload: CalcomWebhookPayload['payload']): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { calcomBookingId: payload.bookingId },
          { calcomBookingUid: payload.uid },
        ],
      },
      include: {
        consultation: true,
      },
    });

    if (!appointment) {
      logger.error('Appointment not found for Cal.com booking:', payload.bookingId);
      return;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        notes: `${appointment.notes || ''}\n[Cancelled] ${payload.cancellationReason || 'Cancelled via Cal.com'}`,
        updatedAt: new Date(),
      },
    });

    // Clean up Daily.co room if exists
    if (appointment.consultation?.dailyRoomId) {
      try {
        await dailyClient.deleteRoom(appointment.consultation.dailyRoomId);
      } catch (error) {
        logger.warn('Failed to delete Daily.co room:', error);
      }
    }

    logger.info('Cancelled appointment from Cal.com:', {
      appointmentId: appointment.id,
      calcomBookingId: payload.bookingId,
    });
  } catch (error) {
    logger.error('Error handling booking cancelled:', error);
    throw error;
  }
};

/**
 * Handle booking confirmed event
 */
const handleBookingConfirmed = async (payload: CalcomWebhookPayload['payload']): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { calcomBookingId: payload.bookingId },
          { calcomBookingUid: payload.uid },
        ],
      },
    });

    if (!appointment) {
      logger.error('Appointment not found for Cal.com booking:', payload.bookingId);
      return;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    });

    logger.info('Confirmed appointment from Cal.com:', {
      appointmentId: appointment.id,
      calcomBookingId: payload.bookingId,
    });
  } catch (error) {
    logger.error('Error handling booking confirmed:', error);
    throw error;
  }
};

/**
 * Handle meeting started event
 */
const handleMeetingStarted = async (payload: CalcomWebhookPayload['payload']): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { calcomBookingId: payload.bookingId },
          { calcomBookingUid: payload.uid },
        ],
      },
      include: {
        consultation: true,
      },
    });

    if (appointment?.consultation) {
      await prisma.consultation.update({
        where: { id: appointment.consultation.id },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });
    }

    logger.info('Meeting started for appointment:', {
      appointmentId: appointment?.id,
      calcomBookingId: payload.bookingId,
    });
  } catch (error) {
    logger.error('Error handling meeting started:', error);
    throw error;
  }
};

/**
 * Handle meeting ended event
 */
const handleMeetingEnded = async (payload: CalcomWebhookPayload['payload']): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { calcomBookingId: payload.bookingId },
          { calcomBookingUid: payload.uid },
        ],
      },
      include: {
        consultation: true,
      },
    });

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });

      if (appointment.consultation) {
        await prisma.consultation.update({
          where: { id: appointment.consultation.id },
          data: {
            status: 'COMPLETED',
            updatedAt: new Date(),
          },
        });
      }
    }

    logger.info('Meeting ended for appointment:', {
      appointmentId: appointment?.id,
      calcomBookingId: payload.bookingId,
    });
  } catch (error) {
    logger.error('Error handling meeting ended:', error);
    throw error;
  }
};

/**
 * Helper function to get default provider ID
 */
const getDefaultProviderId = async (): Promise<string> => {
  const defaultProvider = await prisma.provider.findFirst({
    where: {
      user: {
        email: calcomConfig.defaultProvider.email,
      },
    },
  });

  if (!defaultProvider) {
    throw new Error('Default provider not found');
  }

  return defaultProvider.id;
};

/**
 * Helper function to create consultation with Daily.co room
 */
const createConsultationWithDailyRoom = async (
  appointmentId: string,
  consultationType: 'VIDEO' | 'AUDIO'
): Promise<void> => {
  try {
    const roomProperties = {
      name: `consultation-${appointmentId}-${Date.now()}`,
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      enable_screenshare: true,
      enable_chat: true,
      start_video_off: consultationType === 'AUDIO',
      start_audio_off: false,
      eject_at_room_exp: true,
      eject_after_elapsed: 3600, // 1 hour max
    };

    const dailyRoom = await dailyClient.createRoom(roomProperties);

    await prisma.consultation.create({
      data: {
        appointmentId,
        dailyRoomId: dailyRoom.id,
        dailyRoomName: dailyRoom.name,
        roomUrl: dailyRoom.url,
        status: 'SCHEDULED',
        videoEnabled: consultationType === 'VIDEO',
      },
    });

    logger.info('Created consultation with Daily.co room:', {
      appointmentId,
      roomId: dailyRoom.id,
    });
  } catch (error) {
    logger.error('Failed to create consultation with Daily.co room:', error);
    throw error;
  }
};
