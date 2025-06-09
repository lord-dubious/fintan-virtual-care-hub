
import { Patient, User } from '@/lib/prisma';

const prisma = {
  user: {
    create: async (data: any) => ({ id: 'mock-user-id', ...data.data }),
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
    delete: async (params: any) => ({ id: params.where.id }),
    findUnique: async () => null,
  },
  patient: {
    create: async (data: any) => ({ id: 'mock-patient-id', ...data.data }),
    findUnique: async () => null,
    findMany: async () => [],
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
    delete: async (params: any) => ({ id: params.where.id }),
  },
  $transaction: async (callback: any) => callback(prisma),
};

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

export const patientService = {
  async create(data: PatientCreateInput): Promise<PatientWithUser> {
    const mockUser = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      role: 'PATIENT' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockPatient = {
      id: `patient_${Date.now()}`,
      userId: mockUser.id,
      dateOfBirth: data.dateOfBirth || null,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      user: mockUser
    };

    return mockPatient;
  },

  async findById(id: string): Promise<PatientWithUser | null> {
    return null;
  },

  async getById(id: string): Promise<PatientWithUser | null> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<PatientWithUser | null> {
    return null;
  },

  async getByEmail(email: string): Promise<PatientWithUser | null> {
    return this.findByEmail(email);
  },

  async findMany(): Promise<PatientWithUser[]> {
    return [];
  },

  async getAll(): Promise<PatientWithUser[]> {
    return this.findMany();
  },

  async update(id: string, data: PatientUpdateInput): Promise<PatientWithUser> {
    const mockPatient = {
      id,
      userId: 'mock-user-id',
      dateOfBirth: data.dateOfBirth || null,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      user: {
        id: 'mock-user-id',
        email: data.email || 'mock@example.com',
        name: data.name || 'Mock User',
        phone: data.phone || null,
        role: 'PATIENT' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return mockPatient;
  },

  async delete(id: string): Promise<PatientWithUser> {
    const mockPatient = {
      id,
      userId: 'mock-user-id',
      dateOfBirth: null,
      address: null,
      emergencyContact: null,
      user: {
        id: 'mock-user-id',
        email: 'deleted@example.com',
        name: 'Deleted User',
        phone: null,
        role: 'PATIENT' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return mockPatient;
  },
};
