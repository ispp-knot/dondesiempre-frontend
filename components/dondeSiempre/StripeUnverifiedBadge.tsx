'use client';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { AccountStatusDto } from '@/lib/types/payment/accountStatusDto';

interface Props {
  storeId: string;
}

export function StripeUnverifiedBadge({ storeId }: Props) {
  const stripeStatus = usePassiveFetcher<AccountStatusDto>({
    url: storeId ? `stores/${storeId}/stripe/status` : '',
    enabled: !!storeId,
  });

  if (stripeStatus.isLoading || stripeStatus.data?.verified) return null;

  return (
    <span
      aria-label="Cuenta pendiente de verificación"
      className="absolute -top-1.5 -right-1.5 flex items-center justify-center
                 w-3.5 h-3.5 rounded-full bg-amber-500 text-white
                 text-[8px] font-bold leading-none shadow-sm"
    >
      !
    </span>
  );
}
