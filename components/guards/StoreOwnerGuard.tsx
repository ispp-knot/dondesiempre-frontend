'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Store of which the user should be the owner */
  storeId: string;
  /** Route to redirect to when not authenticated. Defaults to /login. Ignored if fallbackWhenLoggedOut is set. */
  redirectWhenLoggedOut?: string;
  /** Route to redirect to when authenticated but not a store. Defaults to /. Ignored if fallbackWhenNotStore is set. */
  redirectWhenNotStore?: string;
  /** Route to redirect to when authenticated but not the store's owner. Defaults to /. Ignored if fallbackWhenNotStoreOwner is set. */
  redirectWhenNotStoreOwner?: string;
  /** Component to render instead of redirecting when not authenticated. */
  fallbackWhenLoggedOut?: ReactNode;
  /** Component to render instead of redirecting when authenticated but not a store. */
  fallbackWhenNotStore?: ReactNode;
  /** Component to render instead of redirecting when authenticated but not the store's owner. */
  fallbackWhenNotStoreOwner?: ReactNode;
}

/**
 * Client-side guard that ensures the current user is a store owner.
 * By default redirects when the check fails; if a fallback is provided it renders that instead.
 *
 */
export function StoreOwnerGuard({
  children,
  storeId,
  redirectWhenLoggedOut = '/login',
  redirectWhenNotStore = '/',
  redirectWhenNotStoreOwner = '/',
  fallbackWhenLoggedOut,
  fallbackWhenNotStore,
  fallbackWhenNotStoreOwner,
}: Props) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();

  const user = getCurrentUser();
  const isStore = user?.roles.includes('STORE') ?? false;
  const isStoreOwner = user?.store && user?.store.id === storeId;

  useEffect(() => {
    if (!user && !fallbackWhenLoggedOut) {
      router.replace(redirectWhenLoggedOut);
    } else if (user && !isStore && !fallbackWhenNotStore) {
      router.replace(redirectWhenNotStore);
    } else if (user && isStore && !isStoreOwner && !fallbackWhenNotStoreOwner) {
      router.replace(redirectWhenNotStoreOwner);
    }
  }, [
    user,
    storeId,
    isStore,
    isStoreOwner,
    fallbackWhenLoggedOut,
    fallbackWhenNotStore,
    fallbackWhenNotStoreOwner,
    router,
    redirectWhenLoggedOut,
    redirectWhenNotStore,
    redirectWhenNotStoreOwner,
  ]);

  if (!user) return fallbackWhenLoggedOut ? <>{fallbackWhenLoggedOut}</> : null;
  if (!isStore) return fallbackWhenNotStore ? <>{fallbackWhenNotStore}</> : null;
  if (!isStoreOwner) return fallbackWhenNotStoreOwner ? <>{fallbackWhenNotStoreOwner}</> : null;

  return <>{children}</>;
}
