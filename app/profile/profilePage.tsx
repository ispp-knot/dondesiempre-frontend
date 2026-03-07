'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

export function ProfilePage({}) {
  const router = useRouter();
  const { deleteInfo } = useAuth();

  return (
    <Button
      onClick={() => {
        debugger;
        deleteInfo();
        router.push('/login');
      }}
    >
      Log out
    </Button>
  );
}
