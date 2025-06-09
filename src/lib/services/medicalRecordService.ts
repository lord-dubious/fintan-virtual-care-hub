
import { MedicalRecord } from '@/lib/prisma';

const prisma = {
  medicalRecord: {
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    findUnique: async () => null,
    findMany: async () => [],
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
    delete: async (params: any) => ({ id: params.where.id }),
  }
};

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
    });
  },

  async getById(id: string): Promise<MedicalRecord | null> {
    return this.findById(id);
  },

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return prisma.medicalRecord.findMany({
      where: { patientId },
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
    return prisma.medicalRecord.findMany({});
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
