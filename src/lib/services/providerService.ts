
import { Provider, User } from '@/lib/prisma';

const prisma = {
  user: {
    create: async (data: any) => ({ id: 'mock-user-id', ...data.data }),
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
    delete: async (params: any) => ({ id: params.where.id }),
    findUnique: async () => null,
  },
  provider: {
    create: async (data: any) => ({ id: 'mock-provider-id', ...data.data }),
    findUnique: async () => null,
    findMany: async () => [],
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
    delete: async (params: any) => ({ id: params.where.id }),
  },
  availability: {
    findFirst: async () => null,
    create: async (data: any) => ({ id: 'mock-availability-id', ...data.data }),
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
  },
  $transaction: async (callback: any) => callback(prisma),
};

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
    const mockUser = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      role: 'PROVIDER' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockProvider = {
      id: `provider_${Date.now()}`,
      userId: mockUser.id,
      title: data.title || null,
      specialization: data.specialization || null,
      bio: data.bio || null,
      licenseNumber: data.licenseNumber || null,
      user: mockUser
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
    const mockProvider = {
      id,
      userId: 'mock-user-id',
      title: data.title || null,
      specialization: data.specialization || null,
      bio: data.bio || null,
      licenseNumber: data.licenseNumber || null,
      user: {
        id: 'mock-user-id',
        email: data.email || 'mock@example.com',
        name: data.name || 'Mock Provider',
        phone: data.phone || null,
        role: 'PROVIDER' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return mockProvider;
  },

  async delete(id: string): Promise<ProviderWithUser> {
    const mockProvider = {
      id,
      userId: 'mock-user-id',
      title: null,
      specialization: null,
      bio: null,
      licenseNumber: null,
      user: {
        id: 'mock-user-id',
        email: 'deleted@example.com',
        name: 'Deleted Provider',
        phone: null,
        role: 'PROVIDER' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return mockProvider;
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
    return { id: 'mock-availability-id', ...availabilityData };
  },
};
