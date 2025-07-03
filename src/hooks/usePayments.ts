import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, Payment, CreatePaymentData } from '@/api/payments';
import { useToast } from '@/hooks/use-toast';

export const usePayment = (id: string, options?: {
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
}) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      const response = await paymentsApi.getPayment(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment');
      }
      return response.data!;
    },
    enabled: !!id,
    ...options,
  });
};

export const usePaymentByAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['payments', 'appointment', appointmentId],
    queryFn: async () => {
      const response = await paymentsApi.getPaymentByAppointment(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment');
      }
      return response.data!;
    },
    enabled: !!appointmentId,
  });
};

export const useCreateCheckoutSession = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const response = await paymentsApi.createCheckoutSession(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create checkout session');
      }
      return response.data!;
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// New hooks required by PaymentStep.tsx
export const useStripePaymentIntent = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      if (data.paymentMethod !== 'STRIPE') {
        throw new Error('Payment method must be STRIPE for this operation');
      }
      const response = await paymentsApi.createPaymentIntent(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create payment intent');
      }
      return response.data!;
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Intent Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    ...mutation,
    createPaymentIntent: (data: CreatePaymentData) => mutation.mutateAsync(data),
  };
};

export const usePaystackPayment = () => {
  const { toast } = useToast();
  const createCheckout = useCreateCheckoutSession();
  
  return {
    ...createCheckout,
    initializePayment: async (data: CreatePaymentData) => {
      if (data.paymentMethod !== 'PAYSTACK') {
        throw new Error('Payment method must be PAYSTACK for this operation');
      }
      const result = await createCheckout.mutateAsync(data);
      if ('authorizationUrl' in result) {
        return result;
      }
      throw new Error('Invalid response from payment server');
    }
  };
};

export const useProcessPayment = (provider: 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE') => {
  const stripePayment = useStripePaymentIntent();
  const paystackPayment = usePaystackPayment();
  const createCheckout = useCreateCheckoutSession();
  
  // Return the appropriate payment processor based on provider
  switch (provider) {
    case 'STRIPE':
      return stripePayment;
    case 'PAYSTACK':
      return paystackPayment;
    default:
      return createCheckout;
  }
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ provider, reference }: { provider: string; reference: string }) => {
      const response = await paymentsApi.verifyPayment(provider, reference);
      if (!response.success) {
        throw new Error(response.error || 'Failed to verify payment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Payment Verified",
        description: "Your payment has been successfully verified.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { paymentId: string; amount?: number; reason?: string }) => {
      const response = await paymentsApi.refundPayment(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to process refund');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      toast({
        title: "Refund Processed",
        description: "The refund has been processed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Refund Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePaymentMethodConfig = () => {
  return useQuery({
    queryKey: ['payments', 'config'],
    queryFn: async () => {
      const response = await paymentsApi.getPaymentMethodConfig();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment configuration');
      }
      return response.data!;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePaymentHistory = (filters?: any) => {
  return useQuery({
    queryKey: ['payments', 'history', filters],
    queryFn: async () => {
      const response = await paymentsApi.getPaymentHistory(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment history');
      }
      return response.data!;
    },
  });
};
