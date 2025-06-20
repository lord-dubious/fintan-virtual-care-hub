import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { addDays, addWeeks, addMonths, format, parse, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  conflictReason?: string | undefined;
}

export interface AvailabilityRequest {
  providerId: string;
  date: string; // YYYY-MM-DD format
  timezone: string; // e.g., 'America/New_York'
  duration?: number | undefined; // Duration in minutes, default 30
}

export interface RecurringAppointmentRequest {
  patientId: string;
  providerId: string;
  startDateTime: Date;
  duration: number; // in minutes
  reason: string;
  consultationType: 'VIDEO' | 'AUDIO' | 'IN_PERSON';
  recurrencePattern: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceCount?: number | undefined; // Number of occurrences
  recurrenceEndDate?: Date | undefined; // End date for recurrence
  timezone: string;
}

export class SchedulingService {
  /**
   * Get available time slots for a provider on a specific date
   */
  async getAvailableSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
    try {
      const { providerId, date, timezone, duration = 30 } = request;

      // Parse the date and convert to UTC for database queries
      const requestDate = new Date(date + 'T00:00:00');
      const startOfDayUTC = fromZonedTime(startOfDay(requestDate), timezone);
      const endOfDayUTC = fromZonedTime(endOfDay(requestDate), timezone);

      // Get provider availability for the requested day
      const dayOfWeek = format(requestDate, 'EEEE').toUpperCase();
      const providerAvailability = await prisma.availability.findMany({
        where: {
          providerId,
          dayOfWeek,
          isAvailable: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      if (providerAvailability.length === 0) {
        return [];
      }

      // Get existing appointments for the day
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          providerId,
          appointmentDate: {
            gte: startOfDayUTC,
            lte: endOfDayUTC,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
        orderBy: {
          appointmentDate: 'asc',
        },
      });

      // Generate time slots
      const timeSlots: TimeSlot[] = [];

      for (const availability of providerAvailability) {
        const slots = this.generateSlotsFromAvailability(
          availability,
          requestDate,
          timezone,
          duration,
          existingAppointments
        );
        timeSlots.push(...slots);
      }

      return timeSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } catch (error) {
      logger.error('Get available slots error:', error);
      throw new Error('Failed to get available slots');
    }
  }

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(
    providerId: string,
    startDateTime: Date,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<{ available: boolean; conflictReason?: string }> {
    try {
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      // Check for conflicting appointments
      const whereClause: any = {
        providerId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
        },
      };

      if (excludeAppointmentId) {
        whereClause.id = { not: excludeAppointmentId };
      }

      // Simple conflict check - appointments that start within our time slot
      whereClause.appointmentDate = {
        gte: startDateTime,
        lt: endDateTime,
      };

      const conflictingAppointments = await prisma.appointment.findMany({
        where: whereClause,
      });

      if (conflictingAppointments.length > 0) {
        return {
          available: false,
          conflictReason: `Conflicts with existing appointment at ${conflictingAppointments[0]?.appointmentDate}`,
        };
      }

      // Check provider availability for the day and time
      const dayOfWeek = format(startDateTime, 'EEEE').toUpperCase();
      const timeString = format(startDateTime, 'HH:mm');

      const availability = await prisma.availability.findFirst({
        where: {
          providerId,
          dayOfWeek,
          isAvailable: true,
          startTime: {
            lte: timeString,
          },
          endTime: {
            gt: timeString,
          },
        },
      });

      if (!availability) {
        return {
          available: false,
          conflictReason: 'Provider not available at this time',
        };
      }

      return { available: true };
    } catch (error) {
      logger.error('Check slot availability error:', error);
      throw new Error('Failed to check slot availability');
    }
  }

  /**
   * Create recurring appointments
   */
  async createRecurringAppointments(request: RecurringAppointmentRequest): Promise<string[]> {
    try {
      const {
        patientId,
        providerId,
        startDateTime,
        duration,
        reason,
        consultationType,
        recurrencePattern,
        recurrenceCount,
        recurrenceEndDate,
        timezone,
      } = request;

      const appointmentIds: string[] = [];
      const appointments: any[] = [];
      let currentDate = new Date(startDateTime);
      let count = 0;

      // Determine the maximum number of appointments to create
      const maxAppointments = recurrenceCount || 52; // Default to 1 year of weekly appointments

      while (count < maxAppointments) {
        // Check if we've reached the end date
        if (recurrenceEndDate && currentDate > recurrenceEndDate) {
          break;
        }

        // Check if the slot is available
        const availability = await this.isSlotAvailable(providerId, currentDate, duration);
        
        if (availability.available) {
          appointments.push({
            patientId,
            providerId,
            appointmentDate: currentDate,
            reason: `${reason} (Recurring ${count + 1})`,
            consultationType,
            status: 'SCHEDULED',
            duration,
            isRecurring: true,
            recurrencePattern,
          });
        } else {
          logger.warn(`Skipping recurring appointment due to conflict:`, {
            date: currentDate,
            reason: availability.conflictReason,
          });
        }

        // Calculate next occurrence
        switch (recurrencePattern) {
          case 'DAILY':
            currentDate = addDays(currentDate, 1);
            break;
          case 'WEEKLY':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'MONTHLY':
            currentDate = addMonths(currentDate, 1);
            break;
        }

        count++;
      }

      // Create all appointments in a transaction
      if (appointments.length > 0) {
        const createdAppointments = await prisma.$transaction(
          appointments.map(appointment =>
            prisma.appointment.create({
              data: appointment,
            })
          )
        );

        appointmentIds.push(...createdAppointments.map(apt => apt.id));
      }

      logger.info(`Created ${appointmentIds.length} recurring appointments`, {
        patientId,
        providerId,
        pattern: recurrencePattern,
      });

      return appointmentIds;
    } catch (error) {
      logger.error('Create recurring appointments error:', error);
      throw new Error('Failed to create recurring appointments');
    }
  }

  /**
   * Generate time slots from provider availability
   */
  private generateSlotsFromAvailability(
    availability: any,
    date: Date,
    timezone: string,
    duration: number,
    existingAppointments: any[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    // Parse availability times
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);

    // Create start and end times for the day in the specified timezone
    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMin, 0, 0);
    const dayStartUTC = fromZonedTime(dayStart, timezone);

    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMin, 0, 0);
    const dayEndUTC = fromZonedTime(dayEnd, timezone);

    // Generate slots every `duration` minutes
    let currentSlotStart = new Date(dayStartUTC);
    
    while (currentSlotStart < dayEndUTC) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + duration * 60 * 1000);
      
      if (currentSlotEnd > dayEndUTC) {
        break;
      }

      // Check for conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.appointmentDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 30) * 60 * 1000);
        
        return (
          (currentSlotStart >= appointmentStart && currentSlotStart < appointmentEnd) ||
          (currentSlotEnd > appointmentStart && currentSlotEnd <= appointmentEnd) ||
          (currentSlotStart <= appointmentStart && currentSlotEnd >= appointmentEnd)
        );
      });

      const slot: TimeSlot = {
        startTime: new Date(currentSlotStart),
        endTime: new Date(currentSlotEnd),
        isAvailable: !hasConflict,
      };

      if (hasConflict) {
        slot.conflictReason = 'Time slot already booked';
      }

      slots.push(slot);

      // Move to next slot
      currentSlotStart = new Date(currentSlotStart.getTime() + duration * 60 * 1000);
    }

    return slots;
  }

  /**
   * Convert UTC time to user's timezone for display
   */
  formatTimeForTimezone(utcTime: Date, timezone: string): string {
    return formatInTimeZone(utcTime, timezone, 'yyyy-MM-dd HH:mm:ss zzz');
  }

  /**
   * Convert user's timezone time to UTC for storage
   */
  convertToUTC(localTime: Date, timezone: string): Date {
    return fromZonedTime(localTime, timezone);
  }
}

// Export singleton instance
export const schedulingService = new SchedulingService();
