
import React, { useState, useEffect } from 'react';
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
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const consultationPrice = bookingData.consultationType === 'video' ? 85 : 65;

  // Fetch payment method configuration
  const { data: paymentConfig, isLoading: configLoading } = usePaymentMethodConfig();

  // Payment processing hooks
  const stripePaymentIntent = useStripePaymentIntent();
  const paystackPayment = usePaystackPayment();
  const processPayment = useProcessPayment();
  
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
      const paymentData = {
        appointmentId,
        amount: consultationPrice,
        currency: 'USD',
        paymentMethod: bookingData.paymentMethod.toUpperCase() as any,
      };

      switch (bookingData.paymentMethod) {
        case 'stripe':
          if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
            toast({
              title: "Please fill in all card details",
              variant: "destructive"
            });
            return;
          }

          // Create Stripe payment intent
          const stripeIntent = await stripePaymentIntent.mutateAsync({
            appointmentId,
            amount: consultationPrice * 100 // Stripe expects cents
          });

          // In a real implementation, you would use Stripe Elements here
          // For now, we'll simulate the payment
          await processPayment.mutateAsync(paymentData);
          break;

        case 'paystack':
          if (!bookingData.patientInfo?.email) {
            toast({
              title: "Email required for Paystack",
              variant: "destructive"
            });
            return;
          }

          await paystackPayment.mutateAsync({
            appointmentId,
            amount: consultationPrice * 100, // Paystack expects kobo
            email: bookingData.patientInfo.email
          });
          break;

        case 'paypal':
        case 'flutterwave':
          await processPayment.mutateAsync(paymentData);
          break;

        default:
          toast({
            title: "Payment method not supported",
            variant: "destructive"
          });
          return;
      }

      // If we reach here, payment was successful
      onSubmit();

    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
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
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="Full name as displayed on card"
                  className="bg-white dark:bg-gray-700"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="bg-white dark:bg-gray-700"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    className="bg-white dark:bg-gray-700"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    className="bg-white dark:bg-gray-700"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  />
                </div>
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
