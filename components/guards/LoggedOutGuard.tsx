'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  children: ReactNode;
  /** Route to redirect to when already authenticated. Defaults to /. Ignored if fallback is set. */
  redirectTo?: string;
  /** Component to render instead of redirecting when already authenticated. */
  fallback?: ReactNode;
}

/**
 * Client-side guard that forces logout before accessing pages like /login or /register.
 * If the user is already authenticated it redirects away (defaults to /).
 * If `fallback` is provided it renders that instead of redirecting.
 *
 * Use this guard in client components (pages with 'use client').
 */
export function LoggedOutGuard({ children, redirectTo = '/', fallback }: Props) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();

  const user = getCurrentUser();

  useEffect(() => {
    if (user && !fallback) {
      router.replace(redirectTo);
    }
  }, [user, fallback, router, redirectTo]);

  if (user) return fallback ? <>{fallback}</> : null;

  return <>{children}</>;
}
