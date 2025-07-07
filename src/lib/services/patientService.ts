import { PrismaClient } from '@prisma/client';
import {
  PatientWithUser,
  PatientRegistrationFormData,
  UpdatePatientRequest,
  Role,
  ApiResponse,
  User,
} from '../../../shared/domain';
import { hashPassword } from '../../utils/authUtils';

const prisma = new PrismaClient();

export const patientService = {
  async create(data: PatientRegistrationFormData): Promise<ApiResponse<PatientWithUser>> {
    try {
      const hashedPassword = await hashPassword(data.password);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            name: `${data.firstName} ${data.lastName}`.trim(),
            phone: data.phone,
            role: Role.PATIENT,
          },
        });

        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            dateOfBirth: data.dateOfBirth,
          },
          include: { user: true },
        });

        return patient;
      });

      return { success: true, data: result as unknown as PatientWithUser };
    } catch (error) {
      return { success: false, error: 'Failed to create patient' };
    }
  },

  async findById(id: string): Promise<ApiResponse<PatientWithUser | null>> {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true },
      });
      return { success: true, data: patient as unknown as PatientWithUser };
    } catch (error) {
      return { success: false, error: 'Failed to find patient' };
    }
  },

  async getById(id: string): Promise<ApiResponse<PatientWithUser | null>> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<ApiResponse<PatientWithUser | null>> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.role !== Role.PATIENT) {
        return { success: true, data: null };
      }

      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });

      return { success: true, data: patient as unknown as PatientWithUser };
    } catch (error) {
      return { success: false, error: 'Failed to find patient by email' };
    }
  },

  async getByEmail(email: string): Promise<ApiResponse<PatientWithUser | null>> {
    return this.findByEmail(email);
  },

  async findMany(): Promise<ApiResponse<PatientWithUser[]>> {
    try {
      const patients = await prisma.patient.findMany({
        include: { user: true },
      });
      return { success: true, data: patients as unknown as PatientWithUser[] };
    } catch (error) {
      return { success: false, error: 'Failed to find patients' };
    }
  },

  async getAll(): Promise<ApiResponse<PatientWithUser[]>> {
    return this.findMany();
  },

  async update(id: string, data: UpdatePatientRequest): Promise<ApiResponse<PatientWithUser>> {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!patient) {
        return { success: false, error: `Patient with ID ${id} not found` };
      }

      const result = await prisma.patient.update({
        where: { id },
        data: data,
        include: { user: true },
      });

      return { success: true, data: result as unknown as PatientWithUser };
    } catch (error) {
      return { success: false, error: 'Failed to update patient' };
    }
  },

  async delete(id: string): Promise<ApiResponse<PatientWithUser>> {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!patient) {
        return { success: false, error: `Patient with ID ${id} not found` };
      }

      await prisma.user.delete({ where: { id: patient.userId } });

      return { success: true, data: patient as unknown as PatientWithUser };
    } catch (error) {
      return { success: false, error: 'Failed to delete patient' };
    }
  },
};

// Export types for use in hooks
export type PatientCreateInput = PatientRegistrationFormData;
export type PatientUpdateInput = UpdatePatientRequest;
