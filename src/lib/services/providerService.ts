
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

export interface Provider {
  id: string;
  userId: string;
  title?: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderCreateInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  title?: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
}

export interface ProviderUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
}

export interface ProviderWithUser extends Provider {
  user: User;
}

export const providerService = {
  async create(data: ProviderCreateInput): Promise<ProviderWithUser> {
    // Mock implementation
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      role: 'PROVIDER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockProvider: ProviderWithUser = {
      id: `provider_${Date.now()}`,
      userId: mockUser.id,
      title: data.title,
      specialization: data.specialization,
      bio: data.bio,
      licenseNumber: data.licenseNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
    };

    return mockProvider;
  },

  async findById(id: string): Promise<ProviderWithUser | null> {
    return null;
  },

  async getById(id: string): Promise<ProviderWithUser | null> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<ProviderWithUser | null> {
    return null;
  },

  async getByEmail(email: string): Promise<ProviderWithUser | null> {
    return this.findByEmail(email);
  },

  async findMany(filters?: { specialization?: string }): Promise<ProviderWithUser[]> {
    return [];
  },

  async getAll(): Promise<ProviderWithUser[]> {
    return this.findMany();
  },

  async update(id: string, data: ProviderUpdateInput): Promise<ProviderWithUser> {
    throw new Error('Mock implementation - update not available');
  },

  async delete(id: string): Promise<ProviderWithUser> {
    throw new Error('Mock implementation - delete not available');
  },

  async getAvailability(providerId: string, date?: Date): Promise<any[]> {
    return [];
  },

  async setAvailability(providerId: string, availabilityData: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }): Promise<any> {
    return {};
  },
};
