import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointment } from '@/hooks/useAppointments';
import { usePaymentMethodConfig } from '@/hooks/usePayments';
import PaymentGateway from '@/components/payments/PaymentGateway';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button'; // Unused import
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: appointment, isLoading: appointmentLoading, error: appointmentError } = useAppointment(appointmentId || '');
  const { data: paymentConfig, isLoading: configLoading } = usePaymentMethodConfig();
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    navigate(`/payment/success?paymentId=${paymentId}`);
  };

  const handlePaymentFailure = (_error: string) => {
    // Error is already shown in a toast, can add more logic here if needed
  };

  if (appointmentLoading || configLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (appointmentError || !appointment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Appointment</AlertTitle>
          <AlertDescription>
            {appointmentError?.message || "Could not find the specified appointment."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const paymentData = {
    appointmentId: appointment.id,
    amount: 5000, // This should come from the appointment or backend config
    currency: 'USD',
    paymentMethod: selectedMethod as 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE' | 'CREDIT_CARD' | 'BANK_TRANSFER',
  };

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            You are paying for a consultation for "{appointment.patient.user.name}" with "{appointment.provider.user.name}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Amount Due:</h3>
              <p className="text-2xl font-bold">$50.00 USD</p>
            </div>

            <Select onValueChange={setSelectedMethod} value={selectedMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {paymentConfig?.stripe.enabled && <SelectItem value="STRIPE">Credit Card (Stripe)</SelectItem>}
                {paymentConfig?.paystack.enabled && <SelectItem value="PAYSTACK">Paystack</SelectItem>}
                {/* Add other providers as needed */}
              </SelectContent>
            </Select>

            {selectedMethod && (
              <div className="pt-4">
                <PaymentGateway
                  paymentData={paymentData}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage; 