import { PrismaClient, Patient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface PatientCreateInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: string;
}

export interface PatientUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: string;
}

export interface PatientWithUser extends Patient {
  user: User;
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export const patientService = {
  async create(data: PatientCreateInput): Promise<PatientWithUser> {
    const hashedPassword = await hashPassword(data.password);

    return prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          role: UserRole.PATIENT,
        },
      });

      // Then create patient profile
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          emergencyContact: data.emergencyContact,
        },
        include: {
          user: true,
        },
      });

      return patient;
    });
  },

  async findById(id: string): Promise<PatientWithUser | null> {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  },

  async getById(id: string): Promise<PatientWithUser | null> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<PatientWithUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== UserRole.PATIENT) {
      return null;
    }

    return prisma.patient.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
      },
    });
  },

  async getByEmail(email: string): Promise<PatientWithUser | null> {
    return this.findByEmail(email);
  },

  async findMany(): Promise<PatientWithUser[]> {
    return prisma.patient.findMany({
      include: {
        user: true,
      },
    });
  },

  async getAll(): Promise<PatientWithUser[]> {
    return this.findMany();
  },

  async update(id: string, data: PatientUpdateInput): Promise<PatientWithUser> {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      throw new Error(`Patient with ID ${id} not found`);
    }

    return prisma.$transaction(async (tx) => {
      // Update user information
      if (data.name || data.email || data.phone) {
        await tx.user.update({
          where: { id: patient.userId },
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        });
      }

      // Update patient information
      const updatedPatient = await tx.patient.update({
        where: { id },
        data: {
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          emergencyContact: data.emergencyContact,
        },
        include: {
          user: true,
        },
      });

      return updatedPatient;
    });
  },

  async delete(id: string): Promise<PatientWithUser> {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      throw new Error(`Patient with ID ${id} not found`);
    }

    // Delete the user (will cascade delete the patient due to onDelete: Cascade)
    await prisma.user.delete({
      where: { id: patient.userId },
    });

    return patient;
  },
};

