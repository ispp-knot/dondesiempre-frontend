'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  children: ReactNode;
  /** Route to redirect to when not authenticated. Defaults to /login. Ignored if fallbackWhenLoggedOut is set. */
  redirectWhenLoggedOut?: string;
  /** Route to redirect to when authenticated but not a client. Defaults to /. Ignored if fallbackWhenNotClient is set. */
  redirectWhenNotClient?: string;
  /** Component to render instead of redirecting when not authenticated. */
  fallbackWhenLoggedOut?: ReactNode;
  /** Component to render instead of redirecting when authenticated but not a client. */
  fallbackWhenNotClient?: ReactNode;
}

/**
 * Client-side guard that ensures the current user is a regular client (shopper).
 * By default redirects when the check fails; if a fallback is provided it renders that instead.
 *
 * For server-side protection use ServerClientGuard instead.
 */
export function ClientGuard({
  children,
  redirectWhenLoggedOut = '/login',
  redirectWhenNotClient = '/',
  fallbackWhenLoggedOut,
  fallbackWhenNotClient,
}: Props) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();

  const user = getCurrentUser();
  const isClient = user?.roles.includes('CLIENT') ?? false;

  useEffect(() => {
    if (!user && !fallbackWhenLoggedOut) {
      router.replace(redirectWhenLoggedOut);
    } else if (user && !isClient && !fallbackWhenNotClient) {
      router.replace(redirectWhenNotClient);
    }
  }, [
    user,
    isClient,
    fallbackWhenLoggedOut,
    fallbackWhenNotClient,
    router,
    redirectWhenLoggedOut,
    redirectWhenNotClient,
  ]);

  if (!user) return fallbackWhenLoggedOut ? <>{fallbackWhenLoggedOut}</> : null;
  if (!isClient) return fallbackWhenNotClient ? <>{fallbackWhenNotClient}</> : null;

  return <>{children}</>;
}
