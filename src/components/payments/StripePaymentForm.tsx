import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onFailure: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess, onFailure }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (result.error) {
      toast({
        title: "Payment Failed",
        description: result.error.message,
        variant: "destructive"
      });
      onFailure(result.error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else {
      // The customer will be redirected to the `return_url`.
      // The payment success will be handled on that page by verifying the payment intent.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="w-full mt-4">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay Now"}
      </Button>
    </form>
  );
};

export default StripePaymentForm; 