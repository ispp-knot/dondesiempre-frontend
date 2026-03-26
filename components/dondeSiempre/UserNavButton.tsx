'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaRegUser, FaUser } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { RiUserSharedLine, RiUserSharedFill } from 'react-icons/ri';

interface Props {
  /** Whether this button is currently in its active/selected state */
  isActive?: boolean;
  /** Extra className applied to the trigger element */
  className?: string;
}

/**
 * User navigation button used in both the desktop and mobile navbars.
 *
 * - Logged out: renders a Link to /login with RiLoginCircleFill (active) or RiLoginCircleLine (inactive)
 * - Logged in:  renders a Popover trigger with FaUser (active) or FaRegUser (inactive),
 *               and a dropdown showing the display name, profile link and logout button.
 */
export function UserNavButton({ isActive = false, className }: Props) {
  const { getCurrentUser, deleteInfo } = useAuth();
  const router = useRouter();
  const user = getCurrentUser();

  const displayName = user?.store?.name ?? user?.client?.name ?? user?.email ?? null;

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
        <button aria-label="Usuario" className={`cursor-pointer ${className ?? ''}`}>
          {isActive ? <FaUser /> : <FaRegUser />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 flex flex-col gap-2">
        {displayName && (
          <p className="text-sm font-medium truncate text-center border-b pb-2">{displayName}</p>
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
