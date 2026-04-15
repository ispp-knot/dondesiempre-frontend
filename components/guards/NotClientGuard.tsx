'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  children: ReactNode;

  /** Route to redirect to when user is a client. Defaults to /. */
  redirectWhenClient?: string;

  /** Component to render instead of redirecting when user is a client. */
  fallbackWhenClient?: ReactNode;
}

/**
 * Guard that blocks CLIENT users.
 *
 * Allows:
 * - Not logged in users
 * - STORE users
 *
 * Blocks:
 * - Logged in users with CLIENT role
 */
export function NotClientGuard({ children, redirectWhenClient = '/', fallbackWhenClient }: Props) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();

  const user = getCurrentUser();
  const isClient = user?.roles.includes('CLIENT') ?? false;

  useEffect(() => {
    if (user && isClient && !fallbackWhenClient) {
      router.replace(redirectWhenClient);
    }
  }, [user, isClient, fallbackWhenClient, router, redirectWhenClient]);

  if (user && isClient) {
    return fallbackWhenClient ? <>{fallbackWhenClient}</> : null;
  }

  return <>{children}</>;
}
