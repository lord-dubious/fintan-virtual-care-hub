
import prisma from '@/lib/prisma';
import { Patient, User, UserRole } from '../../types/prisma';

export const patientService = {
  async createPatient(userId: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      const patient = await prisma.patient.create({
        data: {
          userId,
          ...data,
        },
      });
      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      return null;
    }
  },

  async getPatientById(id: string): Promise<(Patient & { user?: User }) | null> {
    try {
      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
        },
      });
      return patient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  async getPatientByUserId(userId: string): Promise<(Patient & { user?: User }) | null> {
    try {
      const patient = await prisma.patient.findUnique({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
      });
      return patient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      const patient = await prisma.patient.update({
        where: {
          id: id,
        },
        data: data,
      });
      return patient;
    } catch (error) {
      console.error('Error updating patient:', error);
      return null;
    }
  },

  async deletePatient(id: string): Promise<Patient | null> {
    try {
      const patient = await prisma.patient.delete({
        where: {
          id: id,
        },
      });
      return patient;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return null;
    }
  },
};
