import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, Payment, CreatePaymentData } from '@/api/payments';
import { useToast } from '@/hooks/use-toast';

export const usePayment = (id: string) => {
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

export const useCreatePaymentIntent = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const response = await paymentsApi.createPaymentIntent(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create payment intent');
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

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const response = await paymentsApi.processPayment(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to process payment');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Payment Successful",
        description: "Your appointment has been confirmed and payment processed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ paymentId, transactionId }: { paymentId: string; transactionId: string }) => {
      const response = await paymentsApi.confirmPayment(paymentId, transactionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to confirm payment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Payment Confirmed",
        description: "Your payment has been confirmed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Confirmation Failed",
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

// Stripe specific hooks
export const useStripePaymentIntent = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ appointmentId, amount }: { appointmentId: string; amount: number }) => {
      const response = await paymentsApi.stripe.createPaymentIntent(appointmentId, amount);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create Stripe payment intent');
      }
      return response.data!;
    },
    onError: (error: Error) => {
      toast({
        title: "Stripe Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useConfirmStripePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await paymentsApi.stripe.confirmPayment(paymentIntentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to confirm Stripe payment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Payment Successful",
        description: "Your Stripe payment has been processed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Stripe Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Paystack specific hooks
export const usePaystackPayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ appointmentId, amount, email }: { 
      appointmentId: string; 
      amount: number; 
      email: string; 
    }) => {
      const response = await paymentsApi.paystack.initializePayment(appointmentId, amount, email);
      if (!response.success) {
        throw new Error(response.error || 'Failed to initialize Paystack payment');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Paystack Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useVerifyPaystackPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reference: string) => {
      const response = await paymentsApi.paystack.verifyPayment(reference);
      if (!response.success) {
        throw new Error(response.error || 'Failed to verify Paystack payment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Payment Verified",
        description: "Your Paystack payment has been verified successfully.",
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
