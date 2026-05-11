'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { FaRegUser } from 'react-icons/fa';
import { MdOutlineEmail, MdOutlineLocationOn } from 'react-icons/md';
import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { UserResponseDTO } from '@/lib/types/auth/authDto';
import { useEffect, useState } from 'react';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import UserEditPassword from '@/app/profile/user-edit-password-modal';
import TermsOfServiceModal from '@/components/dondeSiempre/TermsOfServiceModal';
import { StripeOnBoardingButton } from '@/components/dondeSiempre/StripeOnBoardingButton'; // ajusta path
import { StripeDashboardLinkDTO } from '@/lib/types/payment/stripeDashboardLinkDto';
import { AccountStatusDto } from '@/lib/types/payment/accountStatusDto';

export function ProfilePage({}) {
  const router = useRouter();
  const { deleteInfo, registerInfo, getAuthToken } = useAuth();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const meQuery = usePassiveFetcher<UserResponseDTO>({
    url: 'auth/me',
  });

  const verified = usePassiveFetcher<AccountStatusDto>({
    url: `stores/${meQuery?.data?.store?.id}/stripe/status`,
    enabled: !!meQuery?.data?.store?.id,
  });
  const dashboard = usePassiveFetcher<StripeDashboardLinkDTO>({
    url: `stores/${meQuery?.data?.store?.id}/stripe/dashboard`,
    enabled: !!meQuery?.data?.store?.id && !verified.isLoading && verified.data?.verified === true,
  });

  useEffect(() => {
    const token = getAuthToken();
    if (meQuery.data && token) {
      registerInfo(meQuery.data, token);
    }
  }, [meQuery.data, getAuthToken, registerInfo]);

  if (meQuery.isLoading) {
    return <LoadingText />;
  }

  const user = meQuery.data;

  if (!user) {
    return null;
  }

  const profile = user.store ?? user.client ?? null;
  const fullName = profile?.name
    ? `${profile.name} ${user.client?.surname ?? ''}`.trim()
    : user.email;

  const email = profile?.email ?? user.email;
  const address = user.store?.address ?? null;

  const handlePasswordChanged = () => {
    setSuccessMsg('¡Contraseña actualizada con éxito!');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <GlassCenterCard>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full p-3">
            <FaRegUser className="text-xl" />
          </div>
          <CardTitle className="text-lg">{fullName}</CardTitle>
        </div>
        <UserEditPassword onSuccessAction={handlePasswordChanged} />
      </CardHeader>

      {successMsg && (
        <div className="mx-6 px-4 py-2 bg-green-100 text-green-800 text-sm rounded-md border border-green-200 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          {successMsg}
        </div>
      )}

      <CardContent className="flex flex-col gap-3 text-sm my-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MdOutlineEmail className="text-base shrink-0" />
          <span>{email}</span>
        </div>
        {address && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MdOutlineLocationOn className="text-base shrink-0" />
            <span>{address}</span>
          </div>
        )}

        {user?.store?.id && <StripeOnBoardingButton storeId={user.store.id} variant="full" />}
      </CardContent>

      <CardFooter className="border-t mt-3 flex flex-col gap-3">
        {user?.store?.id && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/stores/${user.store!.id}`)}
          >
            Mi tienda
          </Button>
        )}
        {user?.store?.id && (
          <>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              disabled={
                dashboard.isLoading ||
                verified.isLoading ||
                (!verified.isLoading && !verified.data?.verified)
              }
              onClick={
                dashboard.data?.dashboardLink
                  ? () => router.push(dashboard.data.dashboardLink)
                  : () => dashboard.refetch()
              }
            >
              {verified.isLoading ? 'Verificando' : 'Dashboard'}
            </Button>
            {dashboard.isError && (
              <p className="text-[11px] text-destructive px-1 leading-tight">
                No se pudo obtener el enlace.
              </p>
            )}
          </>
        )}
        {user?.store?.id && (
          <Button variant="outline" className="w-full" onClick={() => router.push('/pricing')}>
            Planes y precios
          </Button>
        )}
        <TermsOfServiceModal />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            deleteInfo();
            router.push('/login');
          }}
        >
          Cerrar sesión
        </Button>
      </CardFooter>
    </GlassCenterCard>
  );
}
