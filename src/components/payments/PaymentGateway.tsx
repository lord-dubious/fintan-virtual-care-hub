import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { useCreateCheckoutSession } from '@/hooks/usePayments';
import { CreatePaymentData, PaymentIntent } from '@/api/payments';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentGatewayProps {
  paymentData: CreatePaymentData;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailure: (error: string) => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ paymentData, onPaymentSuccess, onPaymentFailure }) => {
  const { toast } = useToast();
  const createCheckout = useCreateCheckoutSession();

  const handlePayment = async () => {
    try {
      const result = await createCheckout.mutateAsync(paymentData);
      
      if (paymentData.paymentMethod === 'STRIPE') {
        // Stripe will be handled by the StripePaymentForm which needs the client secret
      } else if ('authorizationUrl' in result) {
        // For providers like Paystack, redirect to their page
        window.location.href = result.authorizationUrl;
      } else {
        throw new Error("Unsupported payment provider or invalid response.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during payment initialization";
      toast({
        title: "Payment Initialization Failed",
        description: errorMessage,
        variant: "destructive"
      });
      onPaymentFailure(errorMessage);
    }
  };

  if (createCheckout.isPending) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (paymentData.paymentMethod === 'STRIPE') {
    if (!createCheckout.data || !('clientSecret' in createCheckout.data)) {
      // Need to initiate the checkout to get the client secret
      return <Button onClick={handlePayment}>Pay with Stripe</Button>;
    }

    const { clientSecret } = createCheckout.data as PaymentIntent;
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentForm 
          onSuccess={onPaymentSuccess}
          onFailure={onPaymentFailure}
        />
      </Elements>
    );
  }

  // For other payment methods
  return (
    <Button onClick={handlePayment} disabled={createCheckout.isPending}>
      Proceed to Payment
    </Button>
  );
};

export default PaymentGateway; 