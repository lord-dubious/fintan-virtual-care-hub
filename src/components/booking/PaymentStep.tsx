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
  Apple, 
  Chrome,
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
      id: 'google-pay',
      name: 'Google Pay',
      icon: Chrome,
      description: 'Fast checkout with Google Pay',
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: Apple,
      description: 'Quick and secure Apple Pay',
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: Wallet,
      description: 'Pay with local payment methods',
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-medical-primary/20 dark:border-medical-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
            Appointment Summary
          </CardTitle>
          <CardDescription>Review your booking details before payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Consultation Type</span>
            <span className="font-medium dark:text-medical-dark-text-primary">
              {bookingData.consultationType === 'video' ? 'Video Consultation' : 'Audio Consultation'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Date</span>
            <span className="font-medium dark:text-medical-dark-text-primary">
              {bookingData.date ? format(new Date(bookingData.date), 'PPP') : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Time</span>
            <span className="font-medium dark:text-medical-dark-text-primary">{bookingData.time}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-lg">
            <span className="font-medium dark:text-medical-dark-text-primary">Total Amount</span>
            <span className="font-bold text-medical-primary dark:text-medical-accent">${consultationPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment option</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={bookingData.paymentMethod}
            onValueChange={(value) => updateBookingData({ paymentMethod: value })}
            className="space-y-4"
          >
            {paymentMethods.map((method) => (
              <div key={method.id} className={cn(
                "flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-colors",
                bookingData.paymentMethod === method.id 
                  ? "border-medical-primary dark:border-medical-accent bg-medical-primary/5 dark:bg-medical-accent/5"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              )}>
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <method.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium dark:text-medical-dark-text-primary">{method.name}</div>
                      <div className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                        {method.description}
                      </div>
                    </div>
                  </div>
                </Label>
                {method.brands && (
                  <div className="flex gap-2">
                    {method.brands.map(brand => (
                      <div key={brand} className="w-8 h-5 bg-gray-100 dark:bg-gray-700 rounded">
                        {/* Payment brand logos would go here */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>

          {bookingData.paymentMethod === 'card' && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="Full name as displayed on card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start space-x-2">
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
        className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
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