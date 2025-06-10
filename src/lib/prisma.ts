
// Mock Prisma client for frontend - Prisma should only run on backend
// This prevents the "module is not defined" error in browser

import { User, Patient, Provider, Consultation, MedicalRecord, Payment } from '@/types/prisma';

// Mock Prisma client interface
interface MockPrismaClient {
  user: {
    findUnique: (params: any) => Promise<User | null>;
    findMany: (params?: any) => Promise<User[]>;
    create: (params: any) => Promise<User>;
    update: (params: any) => Promise<User>;
    delete: (params: any) => Promise<User>;
  };
  patient: {
    findUnique: (params: any) => Promise<Patient | null>;
    findMany: (params?: any) => Promise<Patient[]>;
    create: (params: any) => Promise<Patient>;
    update: (params: any) => Promise<Patient>;
    delete: (params: any) => Promise<Patient>;
  };
  provider: {
    findUnique: (params: any) => Promise<Provider | null>;
    findMany: (params?: any) => Promise<Provider[]>;
    create: (params: any) => Promise<Provider>;
    update: (params: any) => Promise<Provider>;
    delete: (params: any) => Promise<Provider>;
  };
  consultation: {
    findUnique: (params: any) => Promise<Consultation | null>;
    findMany: (params?: any) => Promise<Consultation[]>;
    create: (params: any) => Promise<Consultation>;
    update: (params: any) => Promise<Consultation>;
    delete: (params: any) => Promise<Consultation>;
  };
  medicalRecord: {
    findUnique: (params: any) => Promise<MedicalRecord | null>;
    findMany: (params?: any) => Promise<MedicalRecord[]>;
    create: (params: any) => Promise<MedicalRecord>;
    update: (params: any) => Promise<MedicalRecord>;
    delete: (params: any) => Promise<MedicalRecord>;
  };
  payment: {
    findUnique: (params: any) => Promise<Payment | null>;
    findMany: (params?: any) => Promise<Payment[]>;
    create: (params: any) => Promise<Payment>;
    update: (params: any) => Promise<Payment>;
    delete: (params: any) => Promise<Payment>;
  };
  $disconnect: () => Promise<void>;
}

// Create mock implementation
const createMockPrisma = (): MockPrismaClient => {
  const mockOperation = async (operation: string, model: string, data?: any) => {
    console.log(`Mock Prisma ${operation} on ${model}:`, data);
    // Return mock data based on operation
    return { id: 'mock-id', ...data };
  };

  return {
    user: {
      findUnique: async (params) => mockOperation('findUnique', 'user', params),
      findMany: async (params) => [await mockOperation('findMany', 'user', params)],
      create: async (params) => mockOperation('create', 'user', params.data),
      update: async (params) => mockOperation('update', 'user', params.data),
      delete: async (params) => mockOperation('delete', 'user', params),
    },
    patient: {
      findUnique: async (params) => mockOperation('findUnique', 'patient', params),
      findMany: async (params) => [await mockOperation('findMany', 'patient', params)],
      create: async (params) => mockOperation('create', 'patient', params.data),
      update: async (params) => mockOperation('update', 'patient', params.data),
      delete: async (params) => mockOperation('delete', 'patient', params),
    },
    provider: {
      findUnique: async (params) => mockOperation('findUnique', 'provider', params),
      findMany: async (params) => [await mockOperation('findMany', 'provider', params)],
      create: async (params) => mockOperation('create', 'provider', params.data),
      update: async (params) => mockOperation('update', 'provider', params.data),
      delete: async (params) => mockOperation('delete', 'provider', params),
    },
    consultation: {
      findUnique: async (params) => mockOperation('findUnique', 'consultation', params),
      findMany: async (params) => [await mockOperation('findMany', 'consultation', params)],
      create: async (params) => mockOperation('create', 'consultation', params.data),
      update: async (params) => mockOperation('update', 'consultation', params.data),
      delete: async (params) => mockOperation('delete', 'consultation', params),
    },
    medicalRecord: {
      findUnique: async (params) => mockOperation('findUnique', 'medicalRecord', params),
      findMany: async (params) => [await mockOperation('findMany', 'medicalRecord', params)],
      create: async (params) => mockOperation('create', 'medicalRecord', params.data),
      update: async (params) => mockOperation('update', 'medicalRecord', params.data),
      delete: async (params) => mockOperation('delete', 'medicalRecord', params),
    },
    payment: {
      findUnique: async (params) => mockOperation('findUnique', 'payment', params),
      findMany: async (params) => [await mockOperation('findMany', 'payment', params)],
      create: async (params) => mockOperation('create', 'payment', params.data),
      update: async (params) => mockOperation('update', 'payment', params.data),
      delete: async (params) => mockOperation('delete', 'payment', params),
    },
    $disconnect: async () => {
      console.log('Mock Prisma disconnected');
    },
  };
};

const prisma = createMockPrisma();

export default prisma;
export { prisma };
