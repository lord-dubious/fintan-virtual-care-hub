import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVerifyPayment } from '@/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyPayment = useVerifyPayment();

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const paystackRef = searchParams.get('reference');

    let provider = '';
    let reference = '';

    if (paymentIntentId) {
      provider = 'stripe';
      reference = paymentIntentId;
    } else if (paystackRef) {
      provider = 'paystack';
      reference = paystackRef;
    }

    if (provider && reference) {
      verifyPayment.mutate({ provider, reference });
    }
  }, [searchParams, verifyPayment]);

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Verifying your payment...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {verifyPayment.isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>Please wait while we confirm your payment.</p>
            </div>
          )}
          {verifyPayment.isError && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Payment Verification Failed</AlertTitle>
              <AlertDescription>
                {verifyPayment.error instanceof Error ? verifyPayment.error.message : "An unknown error occurred."}
              </AlertDescription>
            </Alert>
          )}
          {verifyPayment.isSuccess && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p>Your appointment is confirmed. Thank you!</p>
              <Button asChild className="mt-4">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage; 