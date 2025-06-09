
// Mock Prisma client for frontend-only demo
// In a real application, Prisma would only be used server-side

// Mock types
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  address: string | null;
  emergencyContact: string | null;
  user?: User;
}

export interface Provider {
  id: string;
  userId: string;
  title: string | null;
  specialization: string | null;
  bio: string | null;
  licenseNumber: string | null;
  user?: User;
}

export interface Appointment {
  id: string;
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  status: string;
  reason: string | null;
  consultationType: 'VIDEO' | 'AUDIO';
  patient?: Patient;
  provider?: Provider;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  sessionId: string | null;
  roomUrl: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  description: string;
  recordType: string | null;
  recordDate: Date;
  patient?: Patient;
}

// Mock Prisma client
export const prisma = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  patient: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  provider: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  appointment: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  consultation: {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  medicalRecord: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  $transaction: async (callback: any) => {
    return callback(prisma);
  },
  $queryRaw: async () => [],
};

// Helper function to handle vector operations
export async function createEmbedding(text: string, dimensions = 1536) {
  // Mock embedding for demo
  return Array(dimensions).fill(0).map(() => Math.random() - 0.5);
}

// Example function to perform vector similarity search
export async function findSimilarEntries(embedding: number[], limit = 5) {
  // Mock similarity search for demo
  return [];
}
