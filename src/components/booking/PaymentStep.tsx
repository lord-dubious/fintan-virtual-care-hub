
import React, { useState } from 'react';
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
  CheckCircle
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

interface PaymentStepProps {
  bookingData: {
    consultationType: string;
    date: Date | null;
    time: string;
    paymentMethod: string;
  };
  updateBookingData: (data: { paymentMethod: string }) => void;
  onSubmit: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ 
  bookingData, 
  updateBookingData,
  onSubmit
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const consultationPrice = bookingData.consultationType === 'video' ? 85 : 65;
  
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay securely with your card',
      brands: ['visa', 'mastercard', 'amex']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: () => <img src="/icons/paypal.svg" alt="PayPal" className="h-5 w-5" />,
      description: 'Fast checkout with PayPal',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: () => <img src="/icons/stripe.svg" alt="Stripe" className="h-5 w-5" />,
      description: 'Secure payments via Stripe',
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: () => <img src="/icons/paystack.svg" alt="Paystack" className="h-5 w-5" />,
      description: 'Pay with Paystack',
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: () => <img src="/icons/flutterwave.svg" alt="Flutterwave" className="h-5 w-5" />,
      description: 'Pay with Flutterwave',
    }
  ];

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

          {bookingData.paymentMethod === 'card' && (
            <div className="mt-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="Full name as displayed on card" className="bg-white dark:bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="bg-white dark:bg-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" placeholder="MM/YY" className="bg-white dark:bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" className="bg-white dark:bg-gray-700" />
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
        onClick={onSubmit}
        disabled={!acceptedTerms}
        className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-6 text-base"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Confirm & Pay ${consultationPrice.toFixed(2)}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </div>
  );
};

export default PaymentStep;
