
import { PrismaClient, Patient } from '@prisma/client';

const prisma = new PrismaClient();

export const patientService = {
  async create(data: any): Promise<Patient> {
    return await prisma.patient.create({
      data,
    });
  },

  async findById(id: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { id },
    });
  },

  async findByEmail(email: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { email },
    });
  },

  async findMany(): Promise<Patient[]> {
    return await prisma.patient.findMany();
  },

  async update(id: string, data: any): Promise<Patient> {
    return await prisma.patient.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<Patient> {
    return await prisma.patient.delete({
      where: { id },
    });
  },
};
