import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consultationService } from '@/lib/services/consultationService';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    consultation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('ConsultationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consultationService).toBeDefined();
  });

  // Add more tests as needed
});
