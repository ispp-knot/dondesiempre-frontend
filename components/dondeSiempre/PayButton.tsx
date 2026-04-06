'use client';

import { useActiveFetcher } from '@/lib/api/fetcher';
import { useRouter } from 'next/navigation';
import { MdOutlinePayments } from 'react-icons/md';
import { Button } from '../ui/button';

interface PayButtonProps {
  orderId: string;
  disabled?: boolean;
  onPayStart?: () => void;
  onPayEnd?: () => void;
}

export function PayButton({ orderId, disabled, onPayStart, onPayEnd }: PayButtonProps) {
  const router = useRouter();
  const initiatePayment = useActiveFetcher<{ sessionUrl: string }>({ method: 'GET' });

  async function handlePay() {
    onPayStart?.();
    try {
      const result = await initiatePayment.fetch({ url: `checkout/${orderId}` });
      if (result?.sessionUrl) {
        router.push(result.sessionUrl);
      }
    } finally {
      onPayEnd?.();
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={disabled || initiatePayment.isPending}
      variant={'secondary'}
    >
      <MdOutlinePayments />
      {initiatePayment.isPending ? 'Redirigiendo...' : 'Pagar'}
    </Button>
  );
}
