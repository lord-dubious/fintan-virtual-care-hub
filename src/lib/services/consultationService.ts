import { PrismaClient, Consultation, ConsultationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConsultationCreateInput {
  appointmentId: string;
  sessionId?: string;
  roomUrl?: string;
  status?: ConsultationStatus;
  notes?: string;
}

export interface ConsultationUpdateInput {
  sessionId?: string;
  roomUrl?: string;
  status?: ConsultationStatus;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface PrescriptionCreateInput {
  consultationId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export const consultationService = {
  async create(data: ConsultationCreateInput): Promise<Consultation> {
    return prisma.consultation.create({
      data: {
        appointmentId: data.appointmentId,
        sessionId: data.sessionId,
        roomUrl: data.roomUrl,
        status: data.status || ConsultationStatus.SCHEDULED,
        notes: data.notes,
      },
    });
  },

  async findById(id: string): Promise<Consultation | null> {
    return prisma.consultation.findUnique({
      where: { id },
      include: {
        appointment: {
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
        },
        prescriptions: true,
      },
    });
  },

  async getById(id: string): Promise<Consultation | null> {
    return this.findById(id);
  },

  async findByAppointmentId(appointmentId: string): Promise<Consultation | null> {
    return prisma.consultation.findUnique({
      where: { appointmentId },
      include: {
        appointment: true,
        prescriptions: true,
      },
    });
  },

  async getByAppointmentId(appointmentId: string): Promise<Consultation | null> {
    return this.findByAppointmentId(appointmentId);
  },

  async findBySessionId(sessionId: string): Promise<Consultation | null> {
    return prisma.consultation.findFirst({
      where: { sessionId },
      include: {
        appointment: true,
        prescriptions: true,
      },
    });
  },

  async getBySessionId(sessionId: string): Promise<Consultation | null> {
    return this.findBySessionId(sessionId);
  },

  async findMany(filters?: {
    status?: ConsultationStatus;
    providerId?: string;
    patientId?: string;
  }): Promise<Consultation[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.providerId || filters?.patientId) {
      where.appointment = {};

      if (filters?.providerId) {
        where.appointment.providerId = filters.providerId;
      }

      if (filters?.patientId) {
        where.appointment.patientId = filters.patientId;
      }
    }

    return prisma.consultation.findMany({
      where,
      include: {
        appointment: {
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
        },
        prescriptions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getAll(): Promise<Consultation[]> {
    return this.findMany();
  },

  async update(id: string, data: ConsultationUpdateInput): Promise<Consultation> {
    return prisma.consultation.update({
      where: { id },
      data,
    });
  },

  async startConsultation(id: string): Promise<Consultation> {
    return prisma.$transaction(async (tx) => {
      const consultation = await tx.consultation.update({
        where: { id },
        data: {
          status: ConsultationStatus.IN_PROGRESS,
          startTime: new Date(),
        },
        include: {
          appointment: true,
        },
      });

      // Update appointment status
      await tx.appointment.update({
        where: { id: consultation.appointmentId },
        data: {
          status: 'IN_PROGRESS',
        },
      });

      return consultation;
    });
  },

  async endConsultation(id: string): Promise<Consultation> {
    return prisma.$transaction(async (tx) => {
      const consultation = await tx.consultation.update({
        where: { id },
        data: {
          status: ConsultationStatus.COMPLETED,
          endTime: new Date(),
        },
        include: {
          appointment: true,
        },
      });

      // Update appointment status
      await tx.appointment.update({
        where: { id: consultation.appointmentId },
        data: {
          status: 'COMPLETED',
        },
      });

      return consultation;
    });
  },

  async addPrescription(data: PrescriptionCreateInput): Promise<any> {
    return prisma.prescription.create({
      data: {
        consultationId: data.consultationId,
        medication: data.medication,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
      },
    });
  },

  async getPrescriptions(consultationId: string): Promise<any[]> {
    return prisma.prescription.findMany({
      where: { consultationId },
    });
  },

  async addNotes(id: string, notes: string): Promise<Consultation> {
    return prisma.consultation.update({
      where: { id },
      data: { notes },
    });
  },
};

