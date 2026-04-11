'use client';
import Link from 'next/link';
import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { StripeOnBoardingLinkDto } from '@/lib/types/payment/stripeOnBoardingLinkDto';
import { AccountStatusDto } from '@/lib/types/payment/accountStatusDto';

interface Props {
  storeId: string;
  variant?: 'compact' | 'full';
}

export function StripeOnBoardingButton({ storeId, variant = 'compact' }: Props) {
  const onBoarding = usePassiveFetcher<StripeOnBoardingLinkDto>({
    url: `stores/${storeId}/stripe/onboarding`,
    enabled: !!storeId,
  });

  const stripeStatus = usePassiveFetcher<AccountStatusDto>({
    url: storeId ? `stores/${storeId}/stripe/status` : '',
    enabled: !!storeId,
  });

  const url = onBoarding.data?.onBoardingLink;
  const isLoading = onBoarding.isLoading || stripeStatus.isLoading;
  const isError = onBoarding.isError;

  if (isLoading || stripeStatus?.data?.verified) return;
  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-1 w-full">
        {isLoading ? (
          <div className="w-full flex items-center justify-center py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : url ? (
          <Link
            href={url}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md
                       text-sm font-medium transition-all duration-200
                       bg-amber-50 border border-amber-400 text-amber-700
                       hover:bg-amber-100 dark:bg-amber-950/60 dark:border-amber-600
                       dark:text-amber-400 dark:hover:bg-amber-900/60"
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Verificar cuenta
            </span>
            <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
          </Link>
        ) : null}

        {!isLoading && !isError && url && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 px-1 leading-tight">
            Tu tienda no puede recibir pagos todavía.
          </p>
        )}
        {isError && (
          <p className="text-[11px] text-destructive px-1 leading-tight">
            No se pudo obtener el enlace. Inténtalo de nuevo.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
      w-full rounded-xl border p-4 flex flex-col gap-3
      bg-amber-50/60 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700
    `}
    >
      {/* Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  bg-amber-100 dark:bg-amber-900"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 truncate">
            Verificación pendiente
          </p>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/70 leading-snug truncate">
            Tu tienda no puede recibir pagos todavía.
          </p>
        </div>
      </div>

      {/* CTA */}
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
        </div>
      ) : url ? (
        <Link
          href={url}
          className="w-full flex items-center justify-center gap-2
                   px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                   bg-amber-500 hover:bg-amber-600 text-white
                   dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Completar verificación
        </Link>
      ) : null}

      {isError && (
        <p className="text-xs text-destructive leading-tight">
          No se pudo obtener el enlace. Inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}
