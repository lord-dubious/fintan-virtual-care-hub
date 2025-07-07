import { PrismaClient, Prisma } from '@prisma/client';
import {
  MedicalRecord,
  ApiResponse,
} from '../../../shared/domain';

const prisma = new PrismaClient();

export const medicalRecordService = {
  async create(data: unknown): Promise<ApiResponse<MedicalRecord>> {
    try {
      const medicalRecord = await prisma.medicalRecord.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      });
      return { success: true, data: medicalRecord as unknown as MedicalRecord };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create medical record' };
    }
  },

  async findById(id: string): Promise<ApiResponse<MedicalRecord | null>> {
    try {
      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
        },
      });
      return { success: true, data: medicalRecord as unknown as MedicalRecord };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to find medical record' };
    }
  },

  async getById(id: string): Promise<ApiResponse<MedicalRecord | null>> {
    return this.findById(id);
  },

  async findByPatientId(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    try {
      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { success: true, data: medicalRecords as unknown as MedicalRecord[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to find medical records' };
    }
  },

  async getByPatientId(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return this.findByPatientId(patientId);
  },

  async findMany(filters?: {
    patientId?: string;
    recordType?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ApiResponse<MedicalRecord[]>> {
    try {
      const where: Prisma.MedicalRecordWhereInput = {};

      if (filters?.patientId) {
        where.patientId = filters.patientId;
      }

      // Note: recordType field doesn't exist in new schema
      // if (filters?.recordType) {
      //   where.recordType = filters.recordType;
      // }

      if (filters?.fromDate || filters?.toDate) {
        where.createdAt = {};
        if (filters?.fromDate) {
          where.createdAt.gte = filters.fromDate;
        }
        if (filters?.toDate) {
          where.createdAt.lte = filters.toDate;
        }
      }

      const medicalRecords = await prisma.medicalRecord.findMany({
        where,
        include: {
          patient: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { success: true, data: medicalRecords as unknown as MedicalRecord[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to find medical records' };
    }
  },

  async getAll(): Promise<ApiResponse<MedicalRecord[]>> {
    return this.findMany();
  },

  async update(id: string, data: Partial<Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<MedicalRecord>> {
    try {
      const medicalRecord = await prisma.medicalRecord.update({
        where: { id },
        data,
      });
      return { success: true, data: medicalRecord as unknown as MedicalRecord };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update medical record' };
    }
  },

  async delete(id: string): Promise<ApiResponse<MedicalRecord>> {
    try {
      const medicalRecord = await prisma.medicalRecord.delete({
        where: { id },
      });
      return { success: true, data: medicalRecord as unknown as MedicalRecord };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete medical record' };
    }
  },
};

