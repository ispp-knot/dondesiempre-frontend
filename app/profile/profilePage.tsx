'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { FaRegUser } from 'react-icons/fa';
import { MdOutlineEmail, MdOutlinePhone, MdOutlineLocationOn } from 'react-icons/md';
import { GlassCenterCard } from '@/components/dondeSiempre/GlassCenterCard';

export function ProfilePage({}) {
  const router = useRouter();
  const { getCurrentUser, deleteInfo } = useAuth();
  const user = getCurrentUser();

  const profile = user?.store ?? user?.client ?? null;
  const name = profile?.name ?? user?.email ?? '';
  const email = profile?.email ?? user?.email ?? '';
  const phone = profile?.phone ?? null;
  const address = profile?.address ?? null;

  return (
    <GlassCenterCard>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full p-3">
            <FaRegUser className="text-xl" />
          </div>
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
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
      <CardFooter className="border-t pt-6">
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
