import { PrismaClient, Appointment, ConsultationType, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface AppointmentCreateInput {
  patientId: string;
  providerId?: string;
  createdById: string;
  consultationType: ConsultationType;
  appointmentDate: Date;
  reason?: string;
  status?: AppointmentStatus;
}

export interface AppointmentUpdateInput {
  patientId?: string;
  providerId?: string;
  consultationType?: ConsultationType;
  appointmentDate?: Date;
  reason?: string;
  status?: AppointmentStatus;
}

export const appointmentService = {
  async create(data: AppointmentCreateInput): Promise<Appointment> {
    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        providerId: data.providerId,
        createdById: data.createdById,
        consultationType: data.consultationType,
        appointmentDate: data.appointmentDate,
        reason: data.reason,
        status: data.status || AppointmentStatus.SCHEDULED,
      },
    });
  },

  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
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
        consultation: true,
        payment: true,
      },
    });
  },

  async getById(id: string): Promise<Appointment | null> {
    return this.findById(id);
  },

  async findMany(filters?: {
    patientId?: string;
    providerId?: string;
    status?: AppointmentStatus;
    from?: Date;
    to?: Date;
  }): Promise<Appointment[]> {
    const where: any = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.from || filters?.to) {
      where.appointmentDate = {};
      
      if (filters?.from) {
        where.appointmentDate.gte = filters.from;
      }
      
      if (filters?.to) {
        where.appointmentDate.lte = filters.to;
      }
    }

    return prisma.appointment.findMany({
      where,
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
        consultation: true,
        payment: true,
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });
  },

  async getAll(): Promise<Appointment[]> {
    return this.findMany();
  },

  async update(id: string, data: AppointmentUpdateInput): Promise<Appointment> {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<Appointment> {
    return prisma.appointment.delete({
      where: { id },
    });
  },

  async getUpcoming(filters?: {
    patientId?: string;
    providerId?: string;
  }): Promise<Appointment[]> {
    const now = new Date();
    
    return this.findMany({
      ...filters,
      from: now,
      status: AppointmentStatus.SCHEDULED,
    });
  },

  async getByPatient(patientId: string): Promise<Appointment[]> {
    return this.findMany({ patientId });
  },

  async getByProvider(providerId: string): Promise<Appointment[]> {
    return this.findMany({ providerId });
  },
};

