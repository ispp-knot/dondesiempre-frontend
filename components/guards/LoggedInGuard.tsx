'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  children: ReactNode;
  /** Route to redirect to when not authenticated. Defaults to /login. Ignored if fallback is set. */
  redirectTo?: string;
  /** Component to render instead of redirecting when not authenticated. */
  fallback?: ReactNode;
}

/**
 * Client-side guard that blocks unauthenticated users.
 * By default redirects to /login; if `fallback` is provided it renders that instead.
 *
 * Use this guard in client components (pages with 'use client').
 */
export function LoggedInGuard({ children, redirectTo = '/login', fallback }: Props) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();

  const user = getCurrentUser();

  useEffect(() => {
    if (!user && !fallback) {
      router.replace(redirectTo);
    }
  }, [user, fallback, router, redirectTo]);

  if (!user) return fallback ? <>{fallback}</> : null;

  return <>{children}</>;
}
