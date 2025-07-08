import { PrismaClient, DayOfWeek, ExceptionType } from '@prisma/client';
import { 
  addDays, 
  format, 
  parseISO, 
  startOfDay, 
  endOfDay, 
  isWithinInterval,
  isSameDay,
  addMinutes,
  differenceInMinutes
} from 'date-fns';

const prisma = new PrismaClient();

export interface ConflictDetails {
  type: 'appointment' | 'break' | 'unavailable' | 'outside_hours' | 'buffer_violation';
  severity: 'error' | 'warning' | 'info';
  message: string;
  conflictingItem?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    type: string;
  };
  suggestedAlternatives?: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface ConflictCheckResult {
  isValid: boolean;
  conflicts: ConflictDetails[];
  warnings: ConflictDetails[];
  suggestions: ConflictDetails[];
}

export interface ScheduleValidationResult {
  isValid: boolean;
  affectedAppointments: {
    id: string;
    appointmentDate: string;
    patientName: string;
    conflictType: string;
    severity: 'error' | 'warning';
  }[];
  conflicts: ConflictDetails[];
}

export class ConflictDetectionService {
  /**
   * Check for conflicts when booking a new appointment
   */
  static async checkAppointmentBooking(
    providerId: string,
    appointmentDate: Date,
    duration: number,
    patientId?: string,
    excludeAppointmentId?: string
  ): Promise<ConflictCheckResult> {
    try {
      const conflicts: ConflictDetails[] = [];
      const warnings: ConflictDetails[] = [];
      const suggestions: ConflictDetails[] = [];

      const startTime = appointmentDate;
      const endTime = addMinutes(appointmentDate, duration);
      const dayOfWeek = this.getDayOfWeek(appointmentDate);

      // Get provider's active schedule
      const schedule = await this.getProviderActiveSchedule(providerId);
      if (!schedule) {
        conflicts.push({
          type: 'unavailable',
          severity: 'error',
          message: 'Provider has no active schedule configured'
        });
        return { isValid: false, conflicts, warnings, suggestions };
      }

      // Check if appointment is within working hours
      const workingHoursCheck = this.checkWorkingHours(
        appointmentDate,
        duration,
        schedule.weeklyAvailability,
        dayOfWeek
      );
      if (!workingHoursCheck.isValid) {
        conflicts.push(...workingHoursCheck.conflicts);
      }

      // Check for schedule exceptions (time off, holidays, etc.)
      const exceptionCheck = await this.checkScheduleExceptions(
        schedule.id,
        appointmentDate,
        duration
      );
      if (!exceptionCheck.isValid) {
        conflicts.push(...exceptionCheck.conflicts);
      }

      // Check for existing appointments
      const appointmentConflicts = await this.checkExistingAppointments(
        providerId,
        startTime,
        endTime,
        excludeAppointmentId
      );
      conflicts.push(...appointmentConflicts);

      // Check for break periods
      const breakConflicts = this.checkBreakPeriods(
        appointmentDate,
        duration,
        schedule.breakPeriods,
        dayOfWeek
      );
      conflicts.push(...breakConflicts);

      // Check buffer time between appointments
      const bufferCheck = await this.checkBufferTime(
        providerId,
        startTime,
        endTime,
        excludeAppointmentId
      );
      warnings.push(...bufferCheck.warnings);

      // Generate alternative suggestions if there are conflicts
      if (conflicts.length > 0) {
        const alternatives = await this.generateAlternativeSlots(
          providerId,
          appointmentDate,
          duration,
          3 // number of alternatives
        );
        if (alternatives.length > 0) {
          suggestions.push({
            type: 'appointment',
            severity: 'info',
            message: 'Alternative time slots available',
            suggestedAlternatives: alternatives
          });
        }
      }

      return {
        isValid: conflicts.length === 0,
        conflicts,
        warnings,
        suggestions
      };
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
    newBreakPeriods: any[],
    newExceptions: any[] = []
  ): Promise<ScheduleValidationResult> {
    try {
      const conflicts: ConflictDetails[] = [];
      const affectedAppointments: ScheduleValidationResult['affectedAppointments'] = [];

      // Get existing appointments for the next 90 days
      const futureDate = addDays(new Date(), 90);
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
        },
        include: {
          patient: {
            include: {
              user: true
            }
          }
        }
      });

      for (const appointment of appointments) {
        const appointmentConflicts: ConflictDetails[] = [];
        const dayOfWeek = this.getDayOfWeek(appointment.appointmentDate);
        const appointmentTime = format(appointment.appointmentDate, 'HH:mm');
        const appointmentEndTime = format(
          addMinutes(appointment.appointmentDate, appointment.duration || 30),
          'HH:mm'
        );

        // Check against new weekly availability
        const dayAvailability = newWeeklyAvailability.filter(wa => 
          wa.dayOfWeek === dayOfWeek && wa.isAvailable
        );

        const isWithinNewHours = dayAvailability.some(avail => 
          this.timeIsWithinRange(appointmentTime, appointmentEndTime, avail.startTime, avail.endTime)
        );

        if (!isWithinNewHours) {
          appointmentConflicts.push({
            type: 'outside_hours',
            severity: 'error',
            message: `Appointment falls outside new working hours`,
            conflictingItem: {
              id: appointment.id,
              title: `Appointment with ${appointment.patient?.user?.name}`,
              startTime: appointmentTime,
              endTime: appointmentEndTime,
              type: 'appointment'
            }
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
            appointmentConflicts.push({
              type: 'break',
              severity: 'error',
              message: `Appointment conflicts with new break period: ${breakPeriod.title || 'Break'}`,
              conflictingItem: {
                id: breakPeriod.id || 'new-break',
                title: breakPeriod.title || 'Break Period',
                startTime: breakPeriod.startTime,
                endTime: breakPeriod.endTime,
                type: 'break'
              }
            });
          }
        }

        // Check against new exceptions
        for (const exception of newExceptions) {
          if (isSameDay(appointment.appointmentDate, new Date(exception.date))) {
            if (exception.type === ExceptionType.UNAVAILABLE) {
              appointmentConflicts.push({
                type: 'unavailable',
                severity: 'error',
                message: `Appointment conflicts with scheduled time off: ${exception.title}`,
                conflictingItem: {
                  id: exception.id || 'new-exception',
                  title: exception.title,
                  startTime: exception.startTime || '00:00',
                  endTime: exception.endTime || '23:59',
                  type: 'exception'
                }
              });
            }
          }
        }

        if (appointmentConflicts.length > 0) {
          conflicts.push(...appointmentConflicts);
          affectedAppointments.push({
            id: appointment.id,
            appointmentDate: appointment.appointmentDate.toISOString(),
            patientName: appointment.patient?.user?.name || 'Unknown Patient',
            conflictType: appointmentConflicts[0].type,
            severity: appointmentConflicts[0].severity
          });
        }
      }

      return {
        isValid: conflicts.length === 0,
        affectedAppointments,
        conflicts
      };
    } catch (error) {
      console.error('Error validating schedule changes:', error);
      throw new Error('Failed to validate schedule changes');
    }
  }

  /**
   * Check for double booking conflicts
   */
  static async checkDoubleBooking(
    providerId: string,
    appointmentDate: Date,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<ConflictDetails[]> {
    const conflicts: ConflictDetails[] = [];
    const startTime = appointmentDate;
    const endTime = addMinutes(appointmentDate, duration);

    const overlappingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        },
        OR: [
          {
            appointmentDate: {
              gte: startTime,
              lt: endTime
            }
          },
          {
            AND: [
              {
                appointmentDate: {
                  lt: startTime
                }
              },
              {
                appointmentDate: {
                  gte: new Date(startTime.getTime() - 60 * 60 * 1000) // Check 1 hour before
                }
              }
            ]
          }
        ]
      },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    for (const appointment of overlappingAppointments) {
      const aptEndTime = addMinutes(appointment.appointmentDate, appointment.duration || 30);
      
      if (
        (appointment.appointmentDate < endTime && aptEndTime > startTime) ||
        (startTime < aptEndTime && endTime > appointment.appointmentDate)
      ) {
        conflicts.push({
          type: 'appointment',
          severity: 'error',
          message: `Double booking conflict with existing appointment`,
          conflictingItem: {
            id: appointment.id,
            title: `Appointment with ${appointment.patient?.user?.name}`,
            startTime: format(appointment.appointmentDate, 'HH:mm'),
            endTime: format(aptEndTime, 'HH:mm'),
            type: 'appointment'
          }
        });
      }
    }

    return conflicts;
  }

  private static async getProviderActiveSchedule(providerId: string) {
    return await prisma.providerSchedule.findFirst({
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
              gte: startOfDay(new Date()),
              lte: endOfDay(addDays(new Date(), 30))
            }
          }
        }
      }
    });
  }

  private static checkWorkingHours(
    appointmentDate: Date,
    duration: number,
    weeklyAvailability: any[],
    dayOfWeek: DayOfWeek
  ): { isValid: boolean; conflicts: ConflictDetails[] } {
    const conflicts: ConflictDetails[] = [];
    const appointmentTime = format(appointmentDate, 'HH:mm');
    const appointmentEndTime = format(addMinutes(appointmentDate, duration), 'HH:mm');

    const dayAvailability = weeklyAvailability.filter(wa => 
      wa.dayOfWeek === dayOfWeek && wa.isAvailable
    );

    if (dayAvailability.length === 0) {
      conflicts.push({
        type: 'outside_hours',
        severity: 'error',
        message: 'Provider is not available on this day'
      });
      return { isValid: false, conflicts };
    }

    const isWithinWorkingHours = dayAvailability.some(avail => 
      this.timeIsWithinRange(appointmentTime, appointmentEndTime, avail.startTime, avail.endTime)
    );

    if (!isWithinWorkingHours) {
      conflicts.push({
        type: 'outside_hours',
        severity: 'error',
        message: 'Appointment is outside provider working hours',
        conflictingItem: {
          id: 'working-hours',
          title: 'Working Hours',
          startTime: dayAvailability[0]?.startTime || '09:00',
          endTime: dayAvailability[0]?.endTime || '17:00',
          type: 'schedule'
        }
      });
    }

    return { isValid: conflicts.length === 0, conflicts };
  }

  private static async checkScheduleExceptions(
    scheduleId: string,
    appointmentDate: Date,
    duration: number
  ): Promise<{ isValid: boolean; conflicts: ConflictDetails[] }> {
    const conflicts: ConflictDetails[] = [];
    
    const exceptions = await prisma.scheduleException.findMany({
      where: {
        scheduleId,
        date: {
          gte: startOfDay(appointmentDate),
          lte: endOfDay(appointmentDate)
        }
      }
    });

    for (const exception of exceptions) {
      if (exception.type === ExceptionType.UNAVAILABLE) {
        conflicts.push({
          type: 'unavailable',
          severity: 'error',
          message: `Provider is unavailable: ${exception.title}`,
          conflictingItem: {
            id: exception.id,
            title: exception.title,
            startTime: exception.startTime || '00:00',
            endTime: exception.endTime || '23:59',
            type: 'exception'
          }
        });
      }
    }

    return { isValid: conflicts.length === 0, conflicts };
  }

  private static async checkExistingAppointments(
    providerId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<ConflictDetails[]> {
    return await this.checkDoubleBooking(providerId, startTime, differenceInMinutes(endTime, startTime), excludeAppointmentId);
  }

  private static checkBreakPeriods(
    appointmentDate: Date,
    duration: number,
    breakPeriods: any[],
    dayOfWeek: DayOfWeek
  ): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    const appointmentTime = format(appointmentDate, 'HH:mm');
    const appointmentEndTime = format(addMinutes(appointmentDate, duration), 'HH:mm');

    const dayBreaks = breakPeriods.filter(bp => 
      !bp.dayOfWeek || bp.dayOfWeek === dayOfWeek
    );

    for (const breakPeriod of dayBreaks) {
      if (this.timeRangesOverlap(appointmentTime, appointmentEndTime, breakPeriod.startTime, breakPeriod.endTime)) {
        conflicts.push({
          type: 'break',
          severity: 'error',
          message: `Appointment conflicts with break period: ${breakPeriod.title || 'Break'}`,
          conflictingItem: {
            id: breakPeriod.id,
            title: breakPeriod.title || 'Break Period',
            startTime: breakPeriod.startTime,
            endTime: breakPeriod.endTime,
            type: 'break'
          }
        });
      }
    }

    return conflicts;
  }

  private static async checkBufferTime(
    providerId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
    bufferMinutes: number = 15
  ): Promise<{ warnings: ConflictDetails[] }> {
    const warnings: ConflictDetails[] = [];
    const bufferStart = addMinutes(startTime, -bufferMinutes);
    const bufferEnd = addMinutes(endTime, bufferMinutes);

    const nearbyAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        },
        appointmentDate: {
          gte: bufferStart,
          lte: bufferEnd
        }
      }
    });

    for (const appointment of nearbyAppointments) {
      const timeDiff = Math.abs(differenceInMinutes(appointment.appointmentDate, startTime));
      if (timeDiff < bufferMinutes) {
        warnings.push({
          type: 'buffer_violation',
          severity: 'warning',
          message: `Less than ${bufferMinutes} minutes between appointments`,
          conflictingItem: {
            id: appointment.id,
            title: 'Adjacent Appointment',
            startTime: format(appointment.appointmentDate, 'HH:mm'),
            endTime: format(addMinutes(appointment.appointmentDate, appointment.duration || 30), 'HH:mm'),
            type: 'appointment'
          }
        });
      }
    }

    return { warnings };
  }

  private static async generateAlternativeSlots(
    providerId: string,
    preferredDate: Date,
    duration: number,
    maxAlternatives: number
  ): Promise<{ date: string; startTime: string; endTime: string }[]> {
    const alternatives: { date: string; startTime: string; endTime: string }[] = [];
    
    // Search for alternatives in the next 7 days
    for (let i = 0; i < 7 && alternatives.length < maxAlternatives; i++) {
      const searchDate = addDays(preferredDate, i);
      const dayOfWeek = this.getDayOfWeek(searchDate);
      
      // Get available slots for this day
      const schedule = await this.getProviderActiveSchedule(providerId);
      if (!schedule) continue;

      const dayAvailability = schedule.weeklyAvailability.filter(wa => 
        wa.dayOfWeek === dayOfWeek && wa.isAvailable
      );

      for (const avail of dayAvailability) {
        const slots = this.generateTimeSlots(avail.startTime, avail.endTime, duration);
        
        for (const slot of slots) {
          const slotDateTime = new Date(`${format(searchDate, 'yyyy-MM-dd')}T${slot.start}:00`);
          const conflictCheck = await this.checkAppointmentBooking(providerId, slotDateTime, duration);
          
          if (conflictCheck.isValid) {
            alternatives.push({
              date: format(searchDate, 'yyyy-MM-dd'),
              startTime: slot.start,
              endTime: slot.end
            });
            
            if (alternatives.length >= maxAlternatives) break;
          }
        }
      }
    }

    return alternatives;
  }

  private static generateTimeSlots(startTime: string, endTime: string, duration: number): { start: string; end: string }[] {
    const slots: { start: string; end: string }[] = [];
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

      currentMinutes += 30; // 30-minute intervals
    }

    return slots;
  }

  private static getDayOfWeek(date: Date): DayOfWeek {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()] as DayOfWeek;
  }

  private static timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && start2 < end1;
  }

  private static timeIsWithinRange(startTime: string, endTime: string, rangeStart: string, rangeEnd: string): boolean {
    return startTime >= rangeStart && endTime <= rangeEnd;
  }
}
