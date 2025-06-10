import { PrismaClient } from '@prisma/client';
import { MedicalRecord } from '../../types/prisma';

const prisma = new PrismaClient();

export interface MedicalRecordCreateInput {
  patientId: string;
  title: string;
  description: string;
  recordType?: string;
  recordDate?: Date;
}

export interface MedicalRecordUpdateInput {
  title?: string;
  description?: string;
  recordType?: string;
  recordDate?: Date;
}

export const medicalRecordService = {
  async create(data: MedicalRecordCreateInput): Promise<MedicalRecord> {
    return prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        recordType: data.recordType,
        recordDate: data.recordDate || new Date(),
      },
    });
  },

  async findById(id: string): Promise<MedicalRecord | null> {
    return prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async getById(id: string): Promise<MedicalRecord | null> {
    return this.findById(id);
  },

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: {
        recordDate: 'desc',
      },
    });
  },

  async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return this.findByPatientId(patientId);
  },

  async findMany(filters?: {
    patientId?: string;
    recordType?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<MedicalRecord[]> {
    const where: any = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.recordType) {
      where.recordType = filters.recordType;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.recordDate = {};
      
      if (filters?.fromDate) {
        where.recordDate.gte = filters.fromDate;
      }
      
      if (filters?.toDate) {
        where.recordDate.lte = filters.toDate;
      }
    }

    return prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        recordDate: 'desc',
      },
    });
  },

  async getAll(): Promise<MedicalRecord[]> {
    return this.findMany();
  },

  async update(id: string, data: MedicalRecordUpdateInput): Promise<MedicalRecord> {
    return prisma.medicalRecord.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<MedicalRecord> {
    return prisma.medicalRecord.delete({
      where: { id },
    });
  },
};
