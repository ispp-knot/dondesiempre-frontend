import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/auth/serverSession';

interface Props {
  children: ReactNode;
  /** Route to redirect to when not authenticated. Defaults to /login. Ignored if fallback is set. */
  redirectTo?: string;
  /** Component to render instead of redirecting when not authenticated. */
  fallback?: ReactNode;
}

/**
 * Server-side guard that blocks unauthenticated users before the page renders.
 * Reads the non-HttpOnly "session" cookie directly — no middleware needed.
 * If `fallback` is provided it renders that instead of redirecting.
 *
 * Usage (in a Server Component or page.tsx):
 *   <ServerLoggedInGuard>
 *     <MyProtectedContent />
 *   </ServerLoggedInGuard>
 */
export async function ServerLoggedInGuard({ children, redirectTo = '/login', fallback }: Props) {
  const session = await getServerSession();
  if (!session) {
    if (fallback) return <>{fallback}</>;
    redirect(redirectTo);
  }
  return <>{children}</>;
}
