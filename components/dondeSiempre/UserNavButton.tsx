'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaRegUser, FaUser } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { RiUserSharedLine, RiUserSharedFill } from 'react-icons/ri';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { AccountStatusDto } from '@/lib/types/payment/accountStatusDto';
import { StripeOnBoardingButton } from './StripeOnBoardingButton';
import { StripeUnverifiedBadge } from './StripeUnverifiedBadge';

interface Props {
  isActive?: boolean;
  className?: string;
}

export function UserNavButton({ isActive = false, className }: Props) {
  const { getCurrentUser, deleteInfo } = useAuth();
  const router = useRouter();
  const user = getCurrentUser();
  const displayName = user?.store?.name ?? user?.client?.name ?? user?.email ?? null;

  const stripeStatus = usePassiveFetcher<AccountStatusDto>({
    url: `stores/${user?.store?.id}/stripe/status`,
    enabled: !!user?.store?.id,
  });
  const isStripeUnverified = !!user?.store?.id && stripeStatus.data?.verified === false;

  function handleLogout() {
    deleteInfo();
    router.push('/login');
  }

  if (!user) {
    return (
      <Link href="/login" aria-label="Iniciar sesión" className={className}>
        {isActive ? <RiUserSharedFill /> : <RiUserSharedLine />}
      </Link>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label="Usuario" className={`cursor-pointer relative ${className ?? ''}`}>
          {isActive ? <FaUser /> : <FaRegUser />}
          {user?.store?.id && <StripeUnverifiedBadge storeId={user.store.id} />}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-52 flex flex-col gap-2">
        {displayName && (
          <p className="text-sm font-medium truncate text-center border-b pb-2">{displayName}</p>
        )}

        {user?.store?.id && !stripeStatus.isLoading && isStripeUnverified && (
          <>
            <div className="flex flex-col gap-1">
              <StripeOnBoardingButton storeId={user.store.id} variant="compact" />
            </div>
            <div className="border-b" />
          </>
        )}

        {user?.store?.id && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/stores/${user.store.id}`}>Mi tienda</Link>
          </Button>
        )}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/profile">Mi perfil</Link>
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </PopoverContent>
    </Popover>
  );
}
