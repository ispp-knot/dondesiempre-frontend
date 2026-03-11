import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/auth/serverSession';

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
 * Server-side guard that ensures the current user is a regular client (shopper).
 * Reads the non-HttpOnly "session" cookie directly — no middleware needed.
 * If a fallback is provided it renders that instead of redirecting.
 *
 * Usage (in a Server Component or page.tsx):
 *   <ServerClientGuard>
 *     <MyClientOnlyContent />
 *   </ServerClientGuard>
 */
export async function ServerClientGuard({
  children,
  redirectWhenLoggedOut = '/login',
  redirectWhenNotClient = '/',
  fallbackWhenLoggedOut,
  fallbackWhenNotClient,
}: Props) {
  const session = await getServerSession();
  if (!session) {
    if (fallbackWhenLoggedOut) return <>{fallbackWhenLoggedOut}</>;
    redirect(redirectWhenLoggedOut);
  }
  if (!session.roles.includes('CLIENT')) {
    if (fallbackWhenNotClient) return <>{fallbackWhenNotClient}</>;
    redirect(redirectWhenNotClient);
  }
  return <>{children}</>;
}
