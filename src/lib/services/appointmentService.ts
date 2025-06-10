
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAppointmentParams {
  patientId: string;
  providerId: string;
  scheduledAt: Date;
  type: string;
  duration: number;
  notes?: string;
}

export interface AppointmentCreateInput {
  patientId: string;
  providerId: string;
  scheduledAt: Date;
  type: string;
  duration: number;
  notes?: string;
}

export interface AppointmentUpdateInput {
  scheduledAt?: Date;
  type?: string;
  duration?: number;
  notes?: string;
  status?: string;
}

export const appointmentService = {
  async getAll() {
    return prisma.appointment.findMany({
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        provider: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  },

  async getUpcoming() {
    return prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        provider: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  },

  async getById(appointmentId: string) {
    return this.getAppointmentById(appointmentId);
  },

  async create(data: AppointmentCreateInput) {
    return this.createAppointment(data);
  },

  async update(appointmentId: string, data: AppointmentUpdateInput) {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        provider: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async delete(appointmentId: string) {
    return this.cancelAppointment(appointmentId);
  },

  async getUserAppointments(userId: string, role: string): Promise<any[]> {
    try {
      const whereClause = role === 'PATIENT' 
        ? { patient: { userId } }
        : { provider: { userId } };

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          provider: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      });

      return appointments;
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      return [];
    }
  },

  async getAppointmentById(appointmentId: string): Promise<any> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          provider: {
            include: {
              user: true,
            },
          },
        },
      });

      return appointment;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }
  },

  async createAppointment(params: CreateAppointmentParams): Promise<any> {
    try {
      const appointment = await prisma.appointment.create({
        data: {
          patientId: params.patientId,
          providerId: params.providerId,
          scheduledAt: params.scheduledAt,
          type: params.type,
          duration: params.duration,
          notes: params.notes,
          status: 'SCHEDULED',
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          provider: {
            include: {
              user: true,
            },
          },
        },
      });

      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          provider: {
            include: {
              user: true,
            },
          },
        },
      });

      return appointment;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  async cancelAppointment(appointmentId: string): Promise<any> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          provider: {
            include: {
              user: true,
            },
          },
        },
      });

      return appointment;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },
};
