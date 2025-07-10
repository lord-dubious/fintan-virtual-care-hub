import { Router } from 'express';
import { handleCalcomWebhook } from '@/controllers/calcomController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { rateLimiters } from '@/middleware/rateLimiter';
import { calcomService } from '@/services/calcomService';
import { Request, Response } from 'express';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

const router = Router();

/**
 * @route   POST /api/calcom/webhooks
 * @desc    Handle Cal.com webhook events
 * @access  Public (verified by signature)
 */
router.post('/webhooks', handleCalcomWebhook);

/**
 * @route   POST /api/calcom/sync-user
 * @desc    Sync user to Cal.com
 * @access  Private
 */
router.post(
  '/sync-user',
  authenticateToken,
  rateLimiters.api,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const calcomUser = await calcomService.syncUserToCalcom(req.user.id);

      res.json({
        success: true,
        data: {
          calcomUserId: calcomUser.id,
          email: calcomUser.email,
          name: calcomUser.name,
          username: calcomUser.username,
        },
      });
    } catch (error) {
      logger.error('Error syncing user to Cal.com:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync user to Cal.com',
      });
    }
  }
);

/**
 * @route   GET /api/calcom/event-types
 * @desc    Get available Cal.com event types
 * @access  Private
 */
router.get(
  '/event-types',
  authenticateToken,
  rateLimiters.api,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const eventTypes = await calcomService.getEventTypes();

      res.json({
        success: true,
        data: eventTypes,
      });
    } catch (error) {
      logger.error('Error getting Cal.com event types:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get event types',
      });
    }
  }
);

/**
 * @route   GET /api/calcom/available-slots
 * @desc    Get available time slots for booking
 * @access  Private
 */
router.get(
  '/available-slots',
  authenticateToken,
  rateLimiters.api,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventTypeId, startDate, endDate } = req.query;

      if (!eventTypeId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'eventTypeId, startDate, and endDate are required',
        });
        return;
      }

      const slots = await calcomService.getAvailableSlots(
        parseInt(eventTypeId as string),
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      logger.error('Error getting available slots:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available slots',
      });
    }
  }
);

/**
 * @route   POST /api/calcom/bookings
 * @desc    Create a new booking via Cal.com
 * @access  Private (Patient)
 */
router.post(
  '/bookings',
  authenticateToken,
  authorizeRoles('PATIENT'),
  rateLimiters.api,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const {
        eventTypeId,
        startTime,
        endTime,
        consultationType = 'VIDEO',
        notes,
      } = req.body;

      if (!eventTypeId || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          error: 'eventTypeId, startTime, and endTime are required',
        });
        return;
      }

      // Ensure user is synced to Cal.com
      await calcomService.syncUserToCalcom(req.user.id);

      const booking = await calcomService.createBooking({
        eventTypeId: parseInt(eventTypeId),
        start: startTime,
        end: endTime,
        attendee: {
          name: req.user.name,
          email: req.user.email,
          timeZone: req.user.timezone || 'UTC',
        },
        metadata: {
          consultationType,
          notes,
          userId: req.user.id,
        },
      });

      res.json({
        success: true,
        data: {
          bookingId: booking.id,
          uid: booking.uid,
          title: booking.title,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          location: booking.location,
        },
      });
    } catch (error) {
      logger.error('Error creating Cal.com booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create booking',
      });
    }
  }
);

/**
 * @route   GET /api/calcom/bookings/:bookingId
 * @desc    Get a specific booking
 * @access  Private
 */
router.get(
  '/bookings/:bookingId',
  authenticateToken,
  rateLimiters.api,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;

      const booking = await calcomService.getBooking(parseInt(bookingId));

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      logger.error('Error getting Cal.com booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get booking',
      });
    }
  }
);

/**
 * @route   POST /api/calcom/bookings/:bookingId/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post(
  '/bookings/:bookingId/cancel',
  authenticateToken,
  rateLimiters.api,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      await calcomService.cancelBooking(parseInt(bookingId), reason);

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling Cal.com booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking',
      });
    }
  }
);

/**
 * @route   POST /api/calcom/bookings/:bookingId/reschedule
 * @desc    Reschedule a booking
 * @access  Private
 */
router.post(
  '/bookings/:bookingId/reschedule',
  authenticateToken,
  rateLimiters.api,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { startTime, endTime } = req.body;

      if (!startTime || !endTime) {
        res.status(400).json({
          success: false,
          error: 'startTime and endTime are required',
        });
        return;
      }

      const booking = await calcomService.rescheduleBooking(
        parseInt(bookingId),
        startTime,
        endTime
      );

      res.json({
        success: true,
        data: {
          bookingId: booking.id,
          uid: booking.uid,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
        },
      });
    } catch (error) {
      logger.error('Error rescheduling Cal.com booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reschedule booking',
      });
    }
  }
);

/**
 * @route   POST /api/calcom/setup-webhook
 * @desc    Set up webhook for Cal.com events (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/setup-webhook',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriberUrl, eventTriggers, secret } = req.body;

      if (!subscriberUrl || !eventTriggers) {
        res.status(400).json({
          success: false,
          error: 'subscriberUrl and eventTriggers are required',
        });
        return;
      }

      const webhook = await calcomService.createWebhook({
        subscriberUrl,
        eventTriggers,
        secret,
      });

      res.json({
        success: true,
        data: webhook,
      });
    } catch (error) {
      logger.error('Error setting up Cal.com webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set up webhook',
      });
    }
  }
);

/**
 * @route   GET /api/calcom/health
 * @desc    Check Cal.com service health
 * @access  Private (Admin)
 */
router.get(
  '/health',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Try to get event types to test connectivity
      const eventTypes = await calcomService.getEventTypes();

      res.json({
        success: true,
        data: {
          status: 'healthy',
          eventTypesCount: eventTypes.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Cal.com health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Cal.com service unavailable',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);

export default router;
