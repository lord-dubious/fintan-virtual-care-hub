import React, { useState, useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  CreditCard,
  Wallet,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PaymentMethodCard from './PaymentMethodCard';
import { usePaymentMethodConfig, useStripePaymentIntent, usePaystackPayment, useProcessPayment } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

interface PaymentStepProps {
  bookingData: {
    consultationType: string;
    date: Date | null;
    time: string;
    paymentMethod: string;
    patientInfo?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  updateBookingData: (data: { paymentMethod: string }) => void;
  onSubmit: () => void;
  appointmentId?: string; // For real payment processing
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  bookingData,
  updateBookingData,
  onSubmit,
  appointmentId
}) => {
  const { toast } = useToast();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Secure Stripe Elements implementation
  const [stripeElements, setStripeElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const stripeInstanceRef = useRef<any>(null);

  // Fetch payment method configuration (must come before useEffect that uses it)
  const { data: paymentConfig, isLoading: configLoading } = usePaymentMethodConfig();

  // Initialize Stripe Elements when Stripe payment method is selected
  useEffect(() => {
    if (bookingData.paymentMethod === 'stripe' && paymentConfig?.stripe?.enabled) {
      const initializeStripe = async () => {
        const stripe = (window as any).Stripe;
        if (!stripe) {
          console.error('Stripe.js not loaded');
          return;
        }

        // Store the Stripe instance in ref for reuse
        stripeInstanceRef.current = stripe;

        const elements = stripe.elements();
        const card = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        });

        setStripeElements(elements);
        setCardElement(card);

        // Mount the card element
        const cardContainer = document.getElementById('stripe-card-element');
        if (cardContainer) {
          card.mount('#stripe-card-element');
        }
      };

      initializeStripe();
    }

    // Cleanup on unmount or payment method change
    return () => {
      if (cardElement) {
        cardElement.unmount();
        setCardElement(null);
        setStripeElements(null);
      }
    };
  }, [bookingData.paymentMethod, paymentConfig?.stripe?.enabled, cardElement]);

  const consultationPrice = bookingData.consultationType === 'video' ? 85 : 65;

  // Payment processing hooks
  const stripePaymentIntent = useStripePaymentIntent();
  const paystackPayment = usePaystackPayment();
  const processPayment = useProcessPayment(bookingData.paymentMethod.toUpperCase() as any);
  
  // Filter payment methods based on configuration
  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card (Stripe)',
      icon: CreditCard,
      description: 'Pay securely with your card via Stripe',
      brands: ['visa', 'mastercard', 'amex'],
      enabled: paymentConfig?.stripe?.enabled ?? true
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: () => <img src="/icons/paystack.svg" alt="Paystack" className="h-5 w-5" />,
      description: 'Pay with Paystack',
      enabled: paymentConfig?.paystack?.enabled ?? true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: () => <img src="/icons/paypal.svg" alt="PayPal" className="h-5 w-5" />,
      description: 'Fast checkout with PayPal',
      enabled: paymentConfig?.paypal?.enabled ?? true
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: () => <img src="/icons/flutterwave.svg" alt="Flutterwave" className="h-5 w-5" />,
      description: 'Pay with Flutterwave',
      enabled: paymentConfig?.flutterwave?.enabled ?? true
    }
  ].filter(method => method.enabled);

  const handlePaymentSubmit = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Please accept terms and conditions",
        variant: "destructive"
      });
      return;
    }

    if (!appointmentId) {
      toast({
        title: "Appointment ID missing",
        description: "Please complete the booking process first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Use typed payment method constant for better type safety
      const getPaymentMethodType = (method: string): 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE' => {
        switch (method.toLowerCase()) {
          case 'stripe': return 'STRIPE';
          case 'paystack': return 'PAYSTACK';
          case 'paypal': return 'PAYPAL';
          case 'flutterwave': return 'FLUTTERWAVE';
          default: return 'STRIPE'; // Default fallback
        }
      };
      
      switch (bookingData.paymentMethod) {
        case 'stripe': {
          if (!cardElement) {
            toast({
              title: "Payment method not ready",
              description: "Please wait for the payment form to load",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }

          // Create Stripe payment intent with proper parameters
          const paymentData = {
            appointmentId,
            amount: consultationPrice * 100, // Stripe expects cents
            currency: 'USD',
            paymentMethod: getPaymentMethodType('stripe'),
          };

          // Create the payment intent
          const stripeIntent = await stripePaymentIntent.createPaymentIntent(paymentData);

          // The response should have a clientSecret property directly
          if (!stripeIntent || !('clientSecret' in stripeIntent)) {
            throw new Error('Failed to create payment intent');
          }

          // Use persisted Stripe instance to confirm payment securely
          const stripe = stripeInstanceRef.current;
          if (!stripe) {
            throw new Error('Stripe not initialised – this should not happen');
          }

          const { error, paymentIntent } = await stripe.confirmCardPayment(
            stripeIntent.clientSecret,
            {
              payment_method: {
                card: cardElement,
                billing_details: {
                  name: bookingData.patientInfo?.name || 'Anonymous',
                  email: bookingData.patientInfo?.email,
                },
              },
            }
          );

          if (error) {
            throw new Error(error.message);
          }

          if (paymentIntent.status === 'succeeded') {
            // Continue with the booking submission
            onSubmit();
          }
          break;
        }

        case 'paystack': {
          if (!bookingData.patientInfo?.email) {
            toast({
              title: "Email required for Paystack",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }

          const paymentData = {
            appointmentId,
            amount: consultationPrice * 100, // Paystack expects kobo
            currency: 'NGN', // Paystack default currency
            paymentMethod: getPaymentMethodType('paystack'),
            metadata: {
              email: bookingData.patientInfo.email
            }
          };

          const result = await paystackPayment.initializePayment(paymentData);
          
          if ('authorizationUrl' in result) {
            window.location.href = result.authorizationUrl;
          } else {
            throw new Error('Invalid response from payment server');
          }
          
          break;
        }

        case 'paypal':
          // PayPal implementation
          toast({
            title: "PayPal Payment",
            description: "PayPal integration coming soon",
          });
          setIsProcessing(false);
          break;

        case 'flutterwave':
          // Flutterwave implementation
          toast({
            title: "Flutterwave Payment",
            description: "Flutterwave integration coming soon",
          });
          setIsProcessing(false);
          break;

        default:
          setIsProcessing(false);
          onSubmit(); // For demo/test, just proceed
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-medical-primary/20 dark:border-medical-accent/20 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
            Appointment Summary
          </CardTitle>
          <CardDescription>Review your booking details before payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Consultation Type</span>
            <span className="font-medium dark:text-medical-dark-text-primary">
              {bookingData.consultationType === 'video' ? 'Video Consultation' : 'Audio Consultation'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Date</span>
            <span className="font-medium dark:text-medical-dark-text-primary">
              {bookingData.date ? format(new Date(bookingData.date), 'PPP') : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Time</span>
            <span className="font-medium dark:text-medical-dark-text-primary">{bookingData.time}</span>
          </div>
          <div className="flex justify-between items-center py-3 text-lg bg-medical-primary/5 dark:bg-medical-accent/5 rounded-lg px-3 mt-2">
            <span className="font-medium dark:text-medical-dark-text-primary">Total Amount</span>
            <span className="font-bold text-medical-primary dark:text-medical-accent">${consultationPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-medical-primary/20 dark:border-medical-accent/20">
        <CardHeader className="bg-gradient-to-r from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10">
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment option</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <RadioGroup
            value={bookingData.paymentMethod}
            onValueChange={(value) => updateBookingData({ paymentMethod: value })}
            className="space-y-4"
          >
            {paymentMethods.map((method) => (
              <PaymentMethodCard 
                key={method.id}
                method={method}
                isSelected={bookingData.paymentMethod === method.id}
              />
            ))}
          </RadioGroup>

          {bookingData.paymentMethod === 'stripe' && (
            <div className="mt-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="stripe-card-element">Card Details</Label>
                <div
                  id="stripe-card-element"
                  className="p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-700 min-h-[50px] flex items-center"
                >
                  {/* Stripe Elements will mount here */}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your card details are securely processed by Stripe and never stored on our servers.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Secured by Stripe - PCI DSS Level 1 compliant</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start space-x-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <Checkbox 
          id="terms" 
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accept terms and conditions
          </Label>
          <p className="text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary">
            By confirming this booking, I agree to Dr. Fintan's terms of service and privacy policy.
          </p>
        </div>
      </div>

      <Button
        onClick={handlePaymentSubmit}
        disabled={!acceptedTerms || isProcessing || configLoading}
        className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-6 text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm & Pay ${consultationPrice.toFixed(2)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </div>
  );
};

export default PaymentStep;
