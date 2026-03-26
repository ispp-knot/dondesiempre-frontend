'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  children: ReactNode;
  /** Route to redirect to when not authenticated. Defaults to /login. Ignored if fallbackWhenLoggedOut is set. */
  redirectWhenLoggedOut?: string;
  /** Route to redirect to when authenticated but not a store. Defaults to /. Ignored if fallbackWhenNotStore is set. */
  redirectWhenNotStore?: string;
  /** Component to render instead of redirecting when not authenticated. */
  fallbackWhenLoggedOut?: ReactNode;
  /** Component to render instead of redirecting when authenticated but not a store. */
  fallbackWhenNotStore?: ReactNode;
}

/**
 * Client-side guard that ensures the current user is a store owner.
 * By default redirects when the check fails; if a fallback is provided it renders that instead.
 *
 * Use this guard in client components (pages with 'use client').
 */
export function StoreGuard({
  children,
  redirectWhenLoggedOut = '/login',
  redirectWhenNotStore = '/',
  fallbackWhenLoggedOut,
  fallbackWhenNotStore,
}: Props) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();

  const user = getCurrentUser();
  const isStore = user?.roles.includes('STORE') ?? false;

  useEffect(() => {
    if (!user && !fallbackWhenLoggedOut) {
      router.replace(redirectWhenLoggedOut);
    } else if (user && !isStore && !fallbackWhenNotStore) {
      router.replace(redirectWhenNotStore);
    }
  }, [
    user,
    isStore,
    fallbackWhenLoggedOut,
    fallbackWhenNotStore,
    router,
    redirectWhenLoggedOut,
    redirectWhenNotStore,
  ]);

  if (!user) return fallbackWhenLoggedOut ? <>{fallbackWhenLoggedOut}</> : null;
  if (!isStore) return fallbackWhenNotStore ? <>{fallbackWhenNotStore}</> : null;

  return <>{children}</>;
}
