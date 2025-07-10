import { PrismaClient, DayOfWeek, ExceptionType } from '@prisma/client';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
  providerId?: string; // Which doctor this slot belongs to
  providerName?: string; // Doctor's name for display
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: {
    type: 'appointment' | 'break' | 'exception';
    startTime: string;
    endTime: string;
    description: string;
  }[];
}

export class AvailabilityService {
  /**
   * Get availability for all active doctors (unified system)
   */
  static async getAvailability(
    startDate: Date,
    endDate: Date,
    slotDuration: number = 30 // minutes
  ): Promise<AvailabilitySlot[]> {
    try {
      // Find ALL active doctors and their schedules
      const providers = await prisma.provider.findMany({
        where: {
          isActive: true,
          isVerified: true
        },
        include: {
          user: {
            select: {
              name: true
            }
          },
          schedules: {
            where: {
              isActive: true,
              isDefault: true
            },
            include: {
              weeklyAvailability: true,
              breakPeriods: true,
              scheduleExceptions: {
                where: {
                  date: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate)
                  }
                }
              }
            }
          }
        }
      });

      if (!providers.length) {
        console.log('No active doctors found in the system');
        return [];
      }

      // Collect all availability slots from all doctors
      const allSlots: AvailabilitySlot[] = [];

      for (const provider of providers) {
        const schedule = provider.schedules[0]; // Get first active schedule

        if (!schedule) {
          console.log(`No schedule found for doctor ${provider.user.name}. Skipping.`);
          continue;
        }

        // Get existing appointments for this provider
        const appointments = await prisma.appointment.findMany({
          where: {
            providerId: provider.id,
            appointmentDate: {
              gte: startOfDay(startDate),
              lte: endOfDay(endDate)
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED']
            }
          }
        });

      const slots: AvailabilitySlot[] = [];
      let currentDate = startOfDay(startDate);

      while (currentDate <= endOfDay(endDate)) {
        const dayOfWeek = this.getDayOfWeek(currentDate);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Check for schedule exceptions
        const exception = schedule.scheduleExceptions.find(ex => 
          format(ex.date, 'yyyy-MM-dd') === dateStr
        );

        if (exception && exception.type === ExceptionType.UNAVAILABLE) {
          slots.push({
            date: dateStr,
            startTime: '00:00',
            endTime: '23:59',
            isAvailable: false,
            reason: exception.title
          });
          currentDate = addDays(currentDate, 1);
          continue;
        }

        // Get weekly availability for this day
        const weeklyAvail = schedule.weeklyAvailability.filter(wa => 
          wa.dayOfWeek === dayOfWeek && wa.isAvailable
        );

        if (weeklyAvail.length === 0) {
          // Day not available
          slots.push({
            date: dateStr,
            startTime: '00:00',
            endTime: '23:59',
            isAvailable: false,
            reason: 'Not available on this day'
          });
          currentDate = addDays(currentDate, 1);
          continue;
        }

        // Generate time slots for available periods
        for (const avail of weeklyAvail) {
          const timeSlots = this.generateTimeSlots(
            avail.startTime,
            avail.endTime,
            slotDuration
          );

          for (const slot of timeSlots) {
            const slotStart = `${dateStr}T${slot.start}:00`;
            const slotEnd = `${dateStr}T${slot.end}:00`;

            // Check for conflicts
            const conflict = this.checkSlotConflicts(
              slotStart,
              slotEnd,
              appointments,
              schedule.breakPeriods.filter(bp => 
                !bp.dayOfWeek || bp.dayOfWeek === dayOfWeek
              ),
              exception
            );

            slots.push({
              date: dateStr,
              startTime: slot.start,
              endTime: slot.end,
              isAvailable: !conflict.hasConflict,
              reason: conflict.hasConflict ? conflict.conflicts[0]?.description : undefined,
              providerId: provider.id,
              providerName: provider.user.name
            });
          }
        }

        currentDate = addDays(currentDate, 1);
      }

      // Add this provider's slots to the collection
      allSlots.push(...slots);
    }

    // Sort all slots by date and time
    allSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return allSlots;
    } catch (error) {
      console.error('Error getting provider availability:', error);
      // Return empty array instead of throwing error to prevent frontend crashes
      console.log(`Returning empty availability due to error`);
      return [];
    }
  }

  /**
   * Check for conflicts when scheduling an appointment
   */
  static async checkAppointmentConflicts(
    providerId: string,
    appointmentDate: Date,
    duration: number
  ): Promise<ConflictResult> {
    try {
      const startTime = appointmentDate;
      const endTime = new Date(appointmentDate.getTime() + duration * 60000);

      // Get active schedule
      const schedule = await prisma.providerSchedule.findFirst({
        where: {
          providerId,
          isActive: true,
          isDefault: true
        },
        include: {
          weeklyAvailability: true,
          breakPeriods: true,
          scheduleExceptions: {
            where: {
              date: {
                gte: startOfDay(appointmentDate),
                lte: endOfDay(appointmentDate)
              }
            }
          }
        }
      });

      if (!schedule) {
        return {
          hasConflict: true,
          conflicts: [{
            type: 'exception',
            startTime: format(startTime, 'HH:mm'),
            endTime: format(endTime, 'HH:mm'),
            description: 'No schedule found for provider'
          }]
        };
      }

      // Get existing appointments
      const appointments = await prisma.appointment.findMany({
        where: {
          providerId,
          appointmentDate: {
            gte: startOfDay(appointmentDate),
            lte: endOfDay(appointmentDate)
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        }
      });

      const dayOfWeek = this.getDayOfWeek(appointmentDate);
      const exception = schedule.scheduleExceptions[0];

      return this.checkSlotConflicts(
        startTime.toISOString(),
        endTime.toISOString(),
        appointments,
        schedule.breakPeriods.filter(bp => 
          !bp.dayOfWeek || bp.dayOfWeek === dayOfWeek
        ),
        exception
      );
    } catch (error) {
      console.error('Error checking appointment conflicts:', error);
      throw new Error('Failed to check appointment conflicts');
    }
  }

  /**
   * Validate schedule changes against existing appointments
   */
  static async validateScheduleChanges(
    scheduleId: string,
    newWeeklyAvailability: any[],
    newBreakPeriods: any[]
  ): Promise<ConflictResult> {
    try {
      // Get existing appointments for the next 30 days
      const futureDate = addDays(new Date(), 30);
      const appointments = await prisma.appointment.findMany({
        where: {
          provider: {
            schedules: {
              some: { id: scheduleId }
            }
          },
          appointmentDate: {
            gte: new Date(),
            lte: futureDate
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        }
      });

      const conflicts: ConflictResult['conflicts'] = [];

      for (const appointment of appointments) {
        const dayOfWeek = this.getDayOfWeek(appointment.appointmentDate);
        const appointmentTime = format(appointment.appointmentDate, 'HH:mm');
        const appointmentEndTime = format(
          new Date(appointment.appointmentDate.getTime() + (appointment.duration || 30) * 60000),
          'HH:mm'
        );

        // Check against new weekly availability
        const dayAvailability = newWeeklyAvailability.filter(wa => 
          wa.dayOfWeek === dayOfWeek && wa.isAvailable
        );

        const isWithinAvailableHours = dayAvailability.some(avail => 
          appointmentTime >= avail.startTime && appointmentEndTime <= avail.endTime
        );

        if (!isWithinAvailableHours) {
          conflicts.push({
            type: 'appointment',
            startTime: appointmentTime,
            endTime: appointmentEndTime,
            description: `Existing appointment on ${format(appointment.appointmentDate, 'yyyy-MM-dd')} conflicts with new availability`
          });
        }

        // Check against new break periods
        const dayBreaks = newBreakPeriods.filter(bp => 
          !bp.dayOfWeek || bp.dayOfWeek === dayOfWeek
        );

        for (const breakPeriod of dayBreaks) {
          if (this.timeRangesOverlap(
            appointmentTime,
            appointmentEndTime,
            breakPeriod.startTime,
            breakPeriod.endTime
          )) {
            conflicts.push({
              type: 'break',
              startTime: appointmentTime,
              endTime: appointmentEndTime,
              description: `Existing appointment conflicts with new break period: ${breakPeriod.title || 'Break'}`
            });
          }
        }
      }

      return {
        hasConflict: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      console.error('Error validating schedule changes:', error);
      throw new Error('Failed to validate schedule changes');
    }
  }

  private static getDayOfWeek(date: Date): DayOfWeek {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()] as DayOfWeek;
  }

  private static generateTimeSlots(startTime: string, endTime: string, duration: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + duration <= endMinutes) {
      const slotStartHour = Math.floor(currentMinutes / 60);
      const slotStartMinute = currentMinutes % 60;
      const slotEndMinutes = currentMinutes + duration;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMinute = slotEndMinutes % 60;

      slots.push({
        start: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`,
        end: `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`
      });

      currentMinutes += duration;
    }

    return slots;
  }

  private static checkSlotConflicts(
    slotStart: string,
    slotEnd: string,
    appointments: any[],
    breakPeriods: any[],
    exception?: any
  ): ConflictResult {
    const conflicts: ConflictResult['conflicts'] = [];
    const slotStartTime = format(new Date(slotStart), 'HH:mm');
    const slotEndTime = format(new Date(slotEnd), 'HH:mm');

    // Check appointment conflicts
    for (const appointment of appointments) {
      const aptStart = format(appointment.appointmentDate, 'HH:mm');
      const aptEnd = format(
        new Date(appointment.appointmentDate.getTime() + (appointment.duration || 30) * 60000),
        'HH:mm'
      );

      if (this.timeRangesOverlap(slotStartTime, slotEndTime, aptStart, aptEnd)) {
        conflicts.push({
          type: 'appointment',
          startTime: aptStart,
          endTime: aptEnd,
          description: 'Existing appointment'
        });
      }
    }

    // Check break conflicts
    for (const breakPeriod of breakPeriods) {
      if (this.timeRangesOverlap(slotStartTime, slotEndTime, breakPeriod.startTime, breakPeriod.endTime)) {
        conflicts.push({
          type: 'break',
          startTime: breakPeriod.startTime,
          endTime: breakPeriod.endTime,
          description: breakPeriod.title || 'Break period'
        });
      }
    }

    // Check exception conflicts
    if (exception && exception.type === ExceptionType.MODIFIED_HOURS) {
      if (exception.startTime && exception.endTime) {
        if (!this.timeRangesOverlap(slotStartTime, slotEndTime, exception.startTime, exception.endTime)) {
          conflicts.push({
            type: 'exception',
            startTime: exception.startTime,
            endTime: exception.endTime,
            description: exception.title
          });
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  }

  private static timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && start2 < end1;
  }
}
