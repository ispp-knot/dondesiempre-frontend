import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/auth/serverSession';

interface Props {
  children: ReactNode;
  /** Route to redirect to when already authenticated. Defaults to /. Ignored if fallback is set. */
  redirectTo?: string;
  /** Component to render instead of redirecting when already authenticated. */
  fallback?: ReactNode;
}

/**
 * Server-side guard that forces logout before accessing pages like /login or /register.
 * If the user is already authenticated it redirects away (defaults to /).
 * Reads the non-HttpOnly "session" cookie directly — no middleware needed.
 * If `fallback` is provided it renders that instead of redirecting.
 *
 * Usage (in a Server Component or page.tsx):
 *   <ServerLoggedOutGuard>
 *     <LoginForm />
 *   </ServerLoggedOutGuard>
 */
export async function ServerLoggedOutGuard({ children, redirectTo = '/', fallback }: Props) {
  const session = await getServerSession();
  if (session) {
    if (fallback) return <>{fallback}</>;
    redirect(redirectTo);
  }
  return <>{children}</>;
}
