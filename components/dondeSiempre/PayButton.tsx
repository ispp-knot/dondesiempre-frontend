'use client';

import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { useRouter } from 'next/navigation';
import { MdOutlinePayments } from 'react-icons/md';
import { Button } from '../ui/button';
import { useState } from 'react';
import { FetchError } from 'ofetch';
import { FaExclamationCircle } from 'react-icons/fa';
import { PaymentInitDto } from '@/lib/types/payment/paymentInitDto';
import { AccountStatusDto } from '@/lib/types/payment/accountStatusDto';

interface PayButtonProps {
  orderId: string;
  disabled?: boolean;
  onPayStart?: () => void;
  onPayEnd?: () => void;
}

export function PayButton({ orderId, disabled, onPayStart, onPayEnd }: PayButtonProps) {
  const router = useRouter();
  const verified = usePassiveFetcher<AccountStatusDto>({
    url: `checkout/${orderId}/stripe/status`,
    enabled: true,
  });
  const initiatePayment = useActiveFetcher<PaymentInitDto>({ method: 'GET' });
  const [error, setError] = useState<string | null>(null);
  async function handlePay() {
    onPayStart?.();
    try {
      const result = await initiatePayment.fetch({ url: `checkout/${orderId}` });
      if (result?.sessionUrl) {
        router.push(result.sessionUrl);
      }
    } catch (err) {
      let message = 'Error al crear la sesión de Stripe. Inténtalo más tarde.';
      if (err instanceof FetchError && err.response?.status === 409) message = err?.data;
      setError(message);
    } finally {
      onPayEnd?.();
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error ? (
        <div className="flex flex-col items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-5 py-2.5">
          <FaExclamationCircle className="text-red-500" style={{ width: 18, height: 18 }} />
          <span className="text-xs font-medium text-red-800 text-center max-w-40 leading-snug">
            {error ||
              (!verified.data?.verified && 'La tienda debe estar verificada para recibir pagos.')}
          </span>
        </div>
      ) : (
        <Button
          onClick={handlePay}
          disabled={
            disabled || initiatePayment.isPending || verified.isLoading || !verified.data?.verified
          }
          variant={'secondary'}
        >
          <MdOutlinePayments />
          {initiatePayment.isPending ? 'Redirigiendo...' : 'Pagar'}
        </Button>
      )}
    </div>
  );
}
