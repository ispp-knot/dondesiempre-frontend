import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/auth/serverSession';

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
 * Server-side guard that ensures the current user is a store owner.
 * Reads the non-HttpOnly "session" cookie directly — no middleware needed.
 * If a fallback is provided it renders that instead of redirecting.
 *
 * Usage (in a Server Component or page.tsx):
 *   <ServerStoreGuard>
 *     <MyStoreOnlyContent />
 *   </ServerStoreGuard>
 */
export async function ServerStoreGuard({
  children,
  redirectWhenLoggedOut = '/login',
  redirectWhenNotStore = '/',
  fallbackWhenLoggedOut,
  fallbackWhenNotStore,
}: Props) {
  const session = await getServerSession();
  if (!session) {
    if (fallbackWhenLoggedOut) return <>{fallbackWhenLoggedOut}</>;
    redirect(redirectWhenLoggedOut);
  }
  if (!session.roles.includes('STORE')) {
    if (fallbackWhenNotStore) return <>{fallbackWhenNotStore}</>;
    redirect(redirectWhenNotStore);
  }
  return <>{children}</>;
}
