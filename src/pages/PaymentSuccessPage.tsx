import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { usePayment, useVerifyPayment } from '@/hooks/usePayments';
import { paymentsApi } from '@/api/payments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const verifyPayment = useVerifyPayment();

  // State for payment confirmation flow
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  // Poll payment status if we have a payment ID
  const { data: payment, isLoading: isPolling, error: pollingError } = usePayment(paymentId || '');

  // Determine if we should continue polling
  const shouldPoll = paymentId && payment &&
    payment.status !== 'COMPLETED' &&
    payment.status !== 'FAILED' &&
    payment.status !== 'CANCELLED';

  // Set up polling interval
  React.useEffect(() => {
    if (!shouldPoll) return;

    const interval = setInterval(() => {
      // Trigger a refetch by updating a state that forces re-render
      window.location.reload();
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldPoll]);

  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      const paymentIntentId = searchParams.get('payment_intent');
      const paystackRef = searchParams.get('reference');
      const paymentIdParam = searchParams.get('payment_id');

      // If we have a payment_id from our own system, use it for polling
      if (paymentIdParam) {
        setPaymentId(paymentIdParam);
        return;
      }

      // Handle Stripe payment intent confirmation
      if (paymentIntentId) {
        setIsConfirming(true);
        try {
          const response = await paymentsApi.confirmPayment(paymentIntentId);
          if (response.success && response.data) {
            setPaymentId(response.data.id);
            toast({
              title: "Payment Confirmed",
              description: "Your payment has been successfully processed.",
            });
          } else {
            throw new Error(response.error || 'Failed to confirm payment');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment';
          setConfirmationError(errorMessage);
          toast({
            title: "Payment Confirmation Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsConfirming(false);
        }
        return;
      }

      // Handle legacy verification for other providers
      if (paystackRef) {
        verifyPayment.mutate({ provider: 'paystack', reference: paystackRef });
        return;
      }

      // If no payment parameters found, show error
      if (!paymentIntentId && !paystackRef && !paymentIdParam) {
        setConfirmationError('No payment information found in URL parameters');
      }
    };

    handlePaymentConfirmation();
  }, [searchParams, verifyPayment, toast]);

  // Determine current status for rendering
  const isLoading = isConfirming || isPolling || verifyPayment.isPending;
  const hasError = confirmationError || pollingError || verifyPayment.isError;
  const isSuccess = payment?.status === 'COMPLETED' || verifyPayment.isSuccess;

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>
            {isLoading ? 'Processing your payment...' :
             isSuccess ? 'Payment successful!' :
             hasError ? 'Payment verification failed' :
             'Verifying your payment...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {/* Loading States */}
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>
                {isConfirming ? 'Confirming your payment...' :
                 isPolling ? 'Checking payment status...' :
                 'Please wait while we verify your payment.'}
              </p>
              {payment && payment.status !== 'COMPLETED' && (
                <div className="text-sm text-muted-foreground">
                  Current status: {payment.status}
                </div>
              )}
            </div>
          )}

          {/* Error States */}
          {hasError && !isLoading && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Verification Failed</AlertTitle>
                <AlertDescription>
                  {confirmationError ||
                   (pollingError instanceof Error ? pollingError.message : '') ||
                   (verifyPayment.error instanceof Error ? verifyPayment.error.message : '') ||
                   "An unknown error occurred during payment verification."}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Success States */}
          {isSuccess && !isLoading && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground">
                Your payment has been processed successfully.
                {payment?.appointmentId && " Your appointment is confirmed!"}
              </p>
              {payment && (
                <div className="bg-muted p-4 rounded-lg w-full">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Payment ID:</span>
                      <span className="font-mono text-xs">{payment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>${payment.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">{payment.status}</span>
                    </div>
                  </div>
                </div>
              )}
              <Button asChild className="mt-4">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {/* Pending/Processing States */}
          {payment && payment.status !== 'COMPLETED' && !isLoading && !hasError && (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <h2 className="text-xl font-semibold">Payment Processing</h2>
              <p className="text-muted-foreground text-center">
                Your payment is being processed. This may take a few moments.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Current Status: {payment.status}</AlertTitle>
                <AlertDescription>
                  We'll automatically update this page when your payment is complete.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage; 