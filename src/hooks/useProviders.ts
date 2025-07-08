import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/api/client';

export interface Provider {
  id: string;
  userId: string;
  specialization?: string;
  bio?: string;
  education?: string;
  experience?: string;
  licenseNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  consultationFee: number;
  user: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };
}

export interface ProvidersResponse {
  providers: Provider[];
  total: number;
  page: number;
  totalPages: number;
}

export const useProviders = (filters?: {
  specialization?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['providers', filters],
    queryFn: async (): Promise<ProvidersResponse> => {
      const response = await apiClient.get<ProvidersResponse>('/providers', filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch providers');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProvider = (providerId: string) => {
  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: async (): Promise<Provider> => {
      const response = await apiClient.get<Provider>(`/providers/${providerId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch provider');
      }
      return response.data!;
    },
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
