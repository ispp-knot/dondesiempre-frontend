'use client';

import { useActiveFetcher } from '@/lib/api/fetcher';
import { useRouter } from 'next/navigation';
import { MdOutlinePayments } from 'react-icons/md';
import { Button } from '../ui/button';
import { useState } from 'react';

interface PayButtonProps {
  orderId: string;
  disabled?: boolean;
  onPayStart?: () => void;
  onPayEnd?: () => void;
}

export function PayButton({ orderId, disabled, onPayStart, onPayEnd }: PayButtonProps) {
  const router = useRouter();
  const initiatePayment = useActiveFetcher<{ sessionUrl: string }>({ method: 'GET' });
  const [error, setError] = useState<string | null>(null);
  async function handlePay() {
    onPayStart?.();
    try {
      const result = await initiatePayment.fetch({ url: `checkout/${orderId}` });
      if (result?.sessionUrl) {
        router.push(result.sessionUrl);
      }
    } catch {
      setError('Error al crear la sesión de Stripe. Inténtalo más tarde.');
    } finally {
      onPayEnd?.();
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={handlePay}
        disabled={disabled || initiatePayment.isPending}
        variant={'secondary'}
      >
        <MdOutlinePayments />
        {initiatePayment.isPending ? 'Redirigiendo...' : 'Pagar'}
      </Button>
      {error && <p className="text-xs text-red-500 text-center max-w-45">{error}</p>}
    </div>
  );
}
