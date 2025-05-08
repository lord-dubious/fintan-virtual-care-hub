
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

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
  const consultationPrice = bookingData.consultationType === 'video' ? 85 : 65;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Payment Details</h2>
      
      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-3 dark:text-medical-dark-text-primary">Appointment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Consultation Type:</span>
            <span className="font-medium dark:text-medical-dark-text-primary">
              {bookingData.consultationType === 'video' ? 'Video Consultation' : 'Audio Consultation'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Date:</span>
            <span className="font-medium dark:text-medical-dark-text-primary">
              {bookingData.date ? format(new Date(bookingData.date), 'PPP') : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">Time:</span>
            <span className="font-medium dark:text-medical-dark-text-primary">{bookingData.time}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"></div>
          <div className="flex justify-between text-base">
            <span className="font-medium dark:text-medical-dark-text-primary">Total:</span>
            <span className="font-semibold dark:text-medical-dark-text-primary">${consultationPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="font-medium mb-3 dark:text-medical-dark-text-primary">Payment Method</h3>
        <RadioGroup
          value={bookingData.paymentMethod}
          onValueChange={(value) => updateBookingData({ paymentMethod: value })}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="dark:text-medical-dark-text-primary">Credit or Debit Card</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="dark:text-medical-dark-text-primary">PayPal</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Card Details (simplified) */}
      {bookingData.paymentMethod === 'card' && (
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="cardName" className="dark:text-medical-dark-text-primary">Name on Card</Label>
            <Input id="cardName" placeholder="Full name as displayed on card" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cardNumber" className="dark:text-medical-dark-text-primary">Card Number</Label>
            <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate" className="dark:text-medical-dark-text-primary">Expiry Date</Label>
              <Input id="expiryDate" placeholder="MM/YY" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cvv" className="dark:text-medical-dark-text-primary">CVV</Label>
              <Input id="cvv" placeholder="123" className="mt-1" />
            </div>
          </div>
        </div>
      )}
      
      {/* PayPal details would go here */}
      {bookingData.paymentMethod === 'paypal' && (
        <div className="text-center p-6 border rounded-md mb-6">
          <p className="dark:text-medical-dark-text-secondary">
            You will be redirected to PayPal to complete your payment after clicking "Confirm Booking".
          </p>
        </div>
      )}
      
      {/* Terms acceptance */}
      <div className="flex items-start space-x-2 mb-6">
        <Checkbox id="terms" />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-medical-dark-text-primary"
          >
            I agree to the terms and conditions
          </Label>
          <p className="text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary">
            By confirming this booking, I agree to Dr. Fintan's terms of service and privacy policy.
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onSubmit}
        className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
      >
        Confirm Booking
      </Button>
      
      <p className="text-xs text-center mt-4 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
        Your payment information is secure and encrypted.
      </p>
    </div>
  );
};

export default PaymentStep;
