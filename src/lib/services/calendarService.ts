import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface AvailabilityResult {
  success: boolean;
  timeSlots?: TimeSlot[];
  message?: string;
}

export const calendarService = {
  // Get available time slots for a provider on a specific date
  async getAvailableTimeSlots(providerId: string, date: Date): Promise<AvailabilityResult> {
    try {
      // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = date.getDay();
      
      // Get the provider's availability for this day of the week
      const availability = await prisma.availability.findFirst({
        where: {
          providerId,
          dayOfWeek,
          isAvailable: true,
        },
      });

      if (!availability) {
        return {
          success: false,
          message: 'Provider is not available on this day',
        };
      }

      // Parse the start and end times
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);

      // Create a new date object for the start and end times
      const startDate = new Date(date);
      startDate.setHours(startHour, startMinute, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(endHour, endMinute, 0, 0);

      // Get all appointments for this provider on this date
      const appointments = await prisma.appointment.findMany({
        where: {
          providerId,
          appointmentDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
        orderBy: {
          appointmentDate: 'asc',
        },
      });

      // Generate time slots (30-minute intervals)
      const timeSlots: TimeSlot[] = [];
      const slotDuration = 30; // minutes
      
      let currentTime = new Date(startDate);
      while (currentTime < endDate) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
        
        // Check if this time slot overlaps with any appointment
        const isAvailable = !appointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointmentDate);
          const appointmentEnd = new Date(appointmentStart);
          appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 30); // Assuming 30-minute appointments
          
          return (
            (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
          );
        });
        
        timeSlots.push({
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
          isAvailable,
        });
        
        // Move to the next time slot
        currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
      }

      return {
        success: true,
        timeSlots,
      };
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return {
        success: false,
        message: 'Failed to get available time slots',
      };
    }
  },

  // Get provider availability for a week
  async getProviderWeeklyAvailability(providerId: string, startDate: Date): Promise<any> {
    try {
      // Get the provider's availability for all days of the week
      const availability = await prisma.availability.findMany({
        where: {
          providerId,
        },
      });

      // Create a map of day of week to availability
      const availabilityMap = new Map();
      availability.forEach(day => {
        availabilityMap.set(day.dayOfWeek, day);
      });

      // Generate dates for the week
      const weekDates = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        const dayOfWeek = date.getDay();
        const dayAvailability = availabilityMap.get(dayOfWeek);
        
        weekDates.push({
          date,
          dayOfWeek,
          isAvailable: dayAvailability ? dayAvailability.isAvailable : false,
          startTime: dayAvailability ? dayAvailability.startTime : null,
          endTime: dayAvailability ? dayAvailability.endTime : null,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return weekDates;
    } catch (error) {
      console.error('Error getting provider weekly availability:', error);
      return [];
    }
  },

  // Update provider availability
  async updateProviderAvailability(providerId: string, dayOfWeek: number, isAvailable: boolean, startTime?: string, endTime?: string): Promise<boolean> {
    try {
      // Check if availability record exists
      const existingAvailability = await prisma.availability.findFirst({
        where: {
          providerId,
          dayOfWeek,
        },
      });

      if (existingAvailability) {
        // Update existing record
        await prisma.availability.update({
          where: {
            id: existingAvailability.id,
          },
          data: {
            isAvailable,
            startTime: startTime || existingAvailability.startTime,
            endTime: endTime || existingAvailability.endTime,
          },
        });
      } else {
        // Create new record
        await prisma.availability.create({
          data: {
            providerId,
            dayOfWeek,
            isAvailable,
            startTime: startTime || '09:00',
            endTime: endTime || '17:00',
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating provider availability:', error);
      return false;
    }
  },

  // Check if a specific time slot is available
  async isTimeSlotAvailable(providerId: string, startTime: Date): Promise<boolean> {
    try {
      // Create end time (30 minutes after start time)
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      // Get the day of the week
      const dayOfWeek = startTime.getDay();
      
      // Check if the provider is available on this day
      const availability = await prisma.availability.findFirst({
        where: {
          providerId,
          dayOfWeek,
          isAvailable: true,
        },
      });

      if (!availability) {
        return false;
      }

      // Parse the provider's availability hours
      const [availStartHour, availStartMinute] = availability.startTime.split(':').map(Number);
      const [availEndHour, availEndMinute] = availability.endTime.split(':').map(Number);
      
      // Create Date objects for comparison
      const availStart = new Date(startTime);
      availStart.setHours(availStartHour, availStartMinute, 0, 0);
      
      const availEnd = new Date(startTime);
      availEnd.setHours(availEndHour, availEndMinute, 0, 0);

      // Check if the requested time is within the provider's availability
      if (startTime < availStart || endTime > availEnd) {
        return false;
      }

      // Check if there are any overlapping appointments
      const overlappingAppointments = await prisma.appointment.findMany({
        where: {
          providerId,
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
          OR: [
            {
              // Appointment starts during the requested slot
              appointmentDate: {
                gte: startTime,
                lt: endTime,
              },
            },
            {
              // Appointment ends during the requested slot
              AND: [
                {
                  appointmentDate: {
                    lt: startTime,
                  },
                },
                {
                  appointmentDate: {
                    gte: new Date(startTime.getTime() - 30 * 60 * 1000), // 30 minutes before
                  },
                },
              ],
            },
          ],
        },
      });

      return overlappingAppointments.length === 0;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  },
};

