import { prisma } from "@/config/database";
import logger from "@/config/logger";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  format,
  startOfDay,
} from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import SlotCalculator from "slot-calculator";

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
  consultationType: "VIDEO" | "AUDIO" | "IN_PERSON";
  recurrencePattern: "DAILY" | "WEEKLY" | "MONTHLY";
  recurrenceCount?: number | undefined; // Number of occurrences
  recurrenceEndDate?: Date | undefined; // End date for recurrence
  timezone: string;
}

export class SchedulingService {
  /**
   * Get available time slots for a provider on a specific date using slot-calculator
   */
  async getAvailableSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
    try {
      const { providerId, date, timezone, duration = 30 } = request;

      logger.info(
        `🔍 Getting available slots for provider ${providerId} on ${date}`
      );

      // Parse the date
      const requestDate = new Date(date + "T00:00:00");
      const dayOfWeek = format(requestDate, "EEEE").toUpperCase();

      // Get provider availability for the requested day
      const providerAvailability = await prisma.availability.findMany({
        where: {
          providerId,
          dayOfWeek,
          isAvailable: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

      if (providerAvailability.length === 0) {
        logger.info(
          `❌ No availability found for provider ${providerId} on ${dayOfWeek}`
        );
        return [];
      }

      // Get existing appointments for the day
      const startOfDayUTC = fromZonedTime(startOfDay(requestDate), timezone);
      const endOfDayUTC = fromZonedTime(endOfDay(requestDate), timezone);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          providerId,
          appointmentDate: {
            gte: startOfDayUTC,
            lte: endOfDayUTC,
          },
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
        },
        select: {
          appointmentDate: true,
          duration: true,
        },
      });

      logger.info(
        `📅 Found ${existingAppointments.length} existing appointments`
      );

      // Use slot-calculator to generate available slots
      const timeSlots: TimeSlot[] = [];

      for (const availability of providerAvailability) {
        const slots = await this.calculateSlotsWithSlotCalculator(
          availability,
          requestDate,
          timezone,
          duration,
          existingAppointments
        );
        timeSlots.push(...slots);
      }

      const sortedSlots = timeSlots.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
      logger.info(`✅ Generated ${sortedSlots.length} time slots`);

      return sortedSlots;
    } catch (error) {
      logger.error("Get available slots error:", error);
      throw new Error("Failed to get available slots");
    }
  }

  /**
   * Calculate available slots using slot-calculator library
   */
  private async calculateSlotsWithSlotCalculator(
    availability: any,
    requestDate: Date,
    timezone: string,
    duration: number,
    existingAppointments: any[]
  ): Promise<TimeSlot[]> {
    try {
      // Create date strings for the specific day
      const dateStr = format(requestDate, "yyyy-MM-dd");
      const startTimeStr = `${dateStr}T${availability.startTime}:00`;
      const endTimeStr = `${dateStr}T${availability.endTime}:00`;

      // Convert to proper Date objects
      const startTime = fromZonedTime(new Date(startTimeStr), timezone);
      const endTime = fromZonedTime(new Date(endTimeStr), timezone);

      // Prepare existing bookings for slot-calculator
      const existingBookings = existingAppointments.map((appointment) => ({
        start: appointment.appointmentDate,
        end: new Date(
          appointment.appointmentDate.getTime() +
            (appointment.duration || 30) * 60 * 1000
        ),
      }));

      // Use slot calculator
      const slots = SlotCalculator.getSlots({
        from: startTime.toISOString(),
        to: endTime.toISOString(),
        duration: duration, // in minutes
        unavailability: existingBookings.map((booking) => ({
          from:
            booking.start instanceof Date
              ? booking.start.toISOString()
              : booking.start,
          to:
            booking.end instanceof Date
              ? booking.end.toISOString()
              : booking.end,
        })),
        outputTimezone: timezone,
      });

      // Get available slots
      const availableSlots = slots.availableSlots;

      // Convert to our TimeSlot format
      // Define the expected slot structure based on slot-calculator API
      interface SlotCalculatorSlot {
        startTime?: string;
        endTime?: string;
        from?: string;
        to?: string;
      }

      return availableSlots.map((slot: SlotCalculatorSlot) => ({
        startTime: new Date(slot.startTime || slot.from || ''),
        endTime: new Date(slot.endTime || slot.to || ''),
        isAvailable: true,
        conflictReason: undefined,
      }));
    } catch (error) {
      logger.error("Error calculating slots with slot-calculator:", error);
      // Fallback to basic slot generation
      return this.generateBasicSlots(
        availability,
        requestDate,
        timezone,
        duration,
        existingAppointments
      );
    }
  }

  /**
   * Fallback method for basic slot generation
   */
  private generateBasicSlots(
    availability: any,
    requestDate: Date,
    timezone: string,
    duration: number,
    existingAppointments: any[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dateStr = format(requestDate, "yyyy-MM-dd");

    // Note: Using time strings directly in Date constructor below

    // Create start and end times for the day
    const dayStart = fromZonedTime(
      new Date(`${dateStr}T${availability.startTime}:00`),
      timezone
    );
    const dayEnd = fromZonedTime(
      new Date(`${dateStr}T${availability.endTime}:00`),
      timezone
    );

    // Generate slots
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);

      if (slotEnd <= dayEnd) {
        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some((appointment) => {
          const appointmentEnd = new Date(
            appointment.appointmentDate.getTime() +
              (appointment.duration || 30) * 60 * 1000
          );

          return (
            (currentTime >= appointment.appointmentDate &&
              currentTime < appointmentEnd) ||
            (slotEnd > appointment.appointmentDate &&
              slotEnd <= appointmentEnd) ||
            (currentTime <= appointment.appointmentDate &&
              slotEnd >= appointmentEnd)
          );
        });

        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          isAvailable: !hasConflict,
          conflictReason: hasConflict
            ? "Appointment already booked"
            : undefined,
        });
      }

      // Move to next slot
      currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    }

    return slots;
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
      const endDateTime = new Date(
        startDateTime.getTime() + duration * 60 * 1000
      );

      // Check for conflicting appointments
      const whereClause: any = {
        providerId,
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
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
      const dayOfWeek = format(startDateTime, "EEEE").toUpperCase();
      const timeString = format(startDateTime, "HH:mm");

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
          conflictReason: "Provider not available at this time",
        };
      }

      return { available: true };
    } catch (error) {
      logger.error("Check slot availability error:", error);
      throw new Error("Failed to check slot availability");
    }
  }

  /**
   * Create recurring appointments
   */
  async createRecurringAppointments(
    request: RecurringAppointmentRequest
  ): Promise<string[]> {
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
        const availability = await this.isSlotAvailable(
          providerId,
          currentDate,
          duration
        );

        if (availability.available) {
          appointments.push({
            patientId,
            providerId,
            appointmentDate: currentDate,
            reason: `${reason} (Recurring ${count + 1})`,
            consultationType,
            status: "SCHEDULED",
            duration,
          });
        } else {
          logger.warn(`Skipping recurring appointment due to conflict:`, {
            date: currentDate,
            reason: availability.conflictReason,
          });
        }

        // Calculate next occurrence
        switch (recurrencePattern) {
          case "DAILY":
            currentDate = addDays(currentDate, 1);
            break;
          case "WEEKLY":
            currentDate = addWeeks(currentDate, 1);
            break;
          case "MONTHLY":
            currentDate = addMonths(currentDate, 1);
            break;
        }

        count++;
      }

      // Create all appointments in a transaction
      if (appointments.length > 0) {
        const createdAppointments = await prisma.$transaction(
          appointments.map((appointment) =>
            prisma.appointment.create({
              data: appointment,
            })
          )
        );

        appointmentIds.push(...createdAppointments.map((apt) => apt.id));
      }

      logger.info(`Created ${appointmentIds.length} recurring appointments`, {
        patientId,
        providerId,
        pattern: recurrencePattern,
      });

      return appointmentIds;
    } catch (error) {
      logger.error("Create recurring appointments error:", error);
      throw new Error("Failed to create recurring appointments");
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
    const [startHour, startMin] = availability.startTime.split(":").map(Number);
    const [endHour, endMin] = availability.endTime.split(":").map(Number);

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
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + duration * 60 * 1000
      );

      if (currentSlotEnd > dayEndUTC) {
        break;
      }

      // Check for conflicts with existing appointments
      const hasConflict = existingAppointments.some((appointment) => {
        const appointmentStart = new Date(appointment.appointmentDate);
        const appointmentEnd = new Date(
          appointmentStart.getTime() + (appointment.duration || 30) * 60 * 1000
        );

        return (
          (currentSlotStart >= appointmentStart &&
            currentSlotStart < appointmentEnd) ||
          (currentSlotEnd > appointmentStart &&
            currentSlotEnd <= appointmentEnd) ||
          (currentSlotStart <= appointmentStart &&
            currentSlotEnd >= appointmentEnd)
        );
      });

      const slot: TimeSlot = {
        startTime: new Date(currentSlotStart),
        endTime: new Date(currentSlotEnd),
        isAvailable: !hasConflict,
      };

      if (hasConflict) {
        slot.conflictReason = "Time slot already booked";
      }

      slots.push(slot);

      // Move to next slot
      currentSlotStart = new Date(
        currentSlotStart.getTime() + duration * 60 * 1000
      );
    }

    return slots;
  }

  /**
   * Convert UTC time to user's timezone for display
   */
  formatTimeForTimezone(utcTime: Date, timezone: string): string {
    return formatInTimeZone(utcTime, timezone, "yyyy-MM-dd HH:mm:ss zzz");
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
