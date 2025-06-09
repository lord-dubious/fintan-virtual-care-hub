
// Mock types for frontend-only demo
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    // Mock implementation
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      role: 'PATIENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPatient: PatientWithUser = {
      id: `patient_${Date.now()}`,
      userId: mockUser.id,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      emergencyContact: data.emergencyContact,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
    };

    return mockPatient;
  },

  async findById(id: string): Promise<PatientWithUser | null> {
    // Mock implementation
    return null;
  },

  async getById(id: string): Promise<PatientWithUser | null> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<PatientWithUser | null> {
    // Mock implementation
    return null;
  },

  async getByEmail(email: string): Promise<PatientWithUser | null> {
    return this.findByEmail(email);
  },

  async findMany(): Promise<PatientWithUser[]> {
    // Mock implementation
    return [];
  },

  async getAll(): Promise<PatientWithUser[]> {
    return this.findMany();
  },

  async update(id: string, data: PatientUpdateInput): Promise<PatientWithUser> {
    // Mock implementation
    throw new Error('Mock implementation - update not available');
  },

  async delete(id: string): Promise<PatientWithUser> {
    // Mock implementation
    throw new Error('Mock implementation - delete not available');
  },
};
