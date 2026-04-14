'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { FaRegUser } from 'react-icons/fa';
import { MdOutlineEmail, MdOutlinePhone, MdOutlineLocationOn } from 'react-icons/md';
import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';
import ClientEditModal from '@/app/profile/client-edit-modal';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { UserResponseDTO } from '@/lib/types/auth/authDto';
import { useEffect, useState } from 'react';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import UserEditPassword from '@/app/profile/user-edit-password-modal';

export function ProfilePage({}) {
  const router = useRouter();
  const { deleteInfo, registerInfo, getAuthToken } = useAuth();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [subscribeButtonLoading, setSubscribeButtonLoading] = useState(false);

  const meQuery = usePassiveFetcher<UserResponseDTO>({
    url: 'auth/me',
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

  // Evitar crasheos si por algún motivo la petición falla
  if (!user) {
    return null;
  }

  const profile = user.store ?? user.client ?? null;
  const fullName = profile?.name
    ? `${profile.name} ${user.client?.surname ?? ''}`.trim()
    : user.email;

  const email = profile?.email ?? user.email;
  const phone = profile?.phone ?? null;
  const address = profile?.address ?? null;

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
        {phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MdOutlinePhone className="text-base shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MdOutlineLocationOn className="text-base shrink-0" />
            <span>{address}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t mt-3 flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          disabled={subscribeButtonLoading}
          onClick={async () => {
            await Notification.requestPermission();

            if (Notification.permission == 'granted') {
              navigator.serviceWorker.controller?.postMessage({ type: 'SETUP_NOTIFS' });
            }

            setSubscribeButtonLoading(true);

            setTimeout(() => setSubscribeButtonLoading(false), 10000);
          }}
        >
          {subscribeButtonLoading ? 'Procesando...' : 'Instalar notificaciones'}
        </Button>
        <p className="text-center">
          Pronto recibirás una notificación que confirme que se han instalado correctamente. De no
          ser así,
          <a href="mailto:dondesiempreispp+notificaciones@gmail.com"> contacta con nosotros</a>.
        </p>
        {user.client && (
          <ClientEditModal
            client={{ ...user.client, email: email }}
            onSavedAction={() => meQuery.refetch()}
          />
        )}
        {user?.store?.id && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              router.push(`/stores/${user.store!.id}`);
            }}
          >
            Mi tienda
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            router.push('/pricing');
          }}
        >
          Planes y precios
        </Button>
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
