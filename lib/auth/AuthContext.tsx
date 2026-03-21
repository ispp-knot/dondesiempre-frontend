'use client';

import type { UserResponseDTO } from '@/lib/types/auth/authDto';
import { pick } from 'lodash';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useActiveFetcher } from '../api/fetcher';

const LOCAL_STORAGE_KEY = 'auth_user';
let lastStoredUserRaw: string | null = null;
let lastStoredUserSnapshot: UserResponseDTO | null = null;

/**
 * Sets the non-HttpOnly "session" cookie.
 *
 * This is intentionally unsigned and not verified â€” use only for routing
 * decisions (guards), never for security-critical logic.
 */
export async function setServerSession(user: UserResponseDTO) {
  const { expiresAt } = user;

  const cookie = btoa(JSON.stringify(pick(user, ['id', 'email', 'roles', 'expiresAt'])));
  document.cookie = `session=${cookie}; expires=${expiresAt}`;
}

/**
 * Clears the non-HttpOnly "session" cookie.
 *
 * This is intentionally unsigned and not verified â€” use only for routing
 * decisions (guards), never for security-critical logic.
 */
export async function clearServerSession() {
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00';
}

interface AuthContextValue {
  /**
   * Returns the currently authenticated user, or null if not logged in
   * (or if the stored token has expired).
   */
  getCurrentUser: () => UserResponseDTO | null;

  /**
   * Persists the given UserInfo to state and localStorage.
   * Call this after a successful /login or /me response.
   */
  registerInfo: (user: UserResponseDTO) => void;

  /**
   * Clears the auth state from memory and localStorage.
   * Does NOT contact the backend â€” you must call your logout endpoint separately.
   */
  deleteInfo: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isExpired(user: Pick<UserResponseDTO, 'expiresAt'>): boolean {
  return new Date(user.expiresAt) <= new Date();
}

function getStoredUserSnapshot(): UserResponseDTO | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawUser === lastStoredUserRaw) {
    return lastStoredUserSnapshot;
  }

  if (!rawUser) {
    lastStoredUserRaw = null;
    lastStoredUserSnapshot = null;
    return null;
  }

  try {
    const storedUser = JSON.parse(rawUser) as UserResponseDTO;

    if (isExpired(storedUser)) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      lastStoredUserRaw = null;
      lastStoredUserSnapshot = null;
      return null;
    }

    lastStoredUserRaw = rawUser;
    lastStoredUserSnapshot = storedUser;
    return storedUser;
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    lastStoredUserRaw = null;
    lastStoredUserSnapshot = null;
    return null;
  }
}

function subscribeToStoredUser(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: UserResponseDTO | null;
}) {
  const [user, setUser] = useState<UserResponseDTO | null>(() => {
    if (!initialUser || isExpired(initialUser)) {
      return null;
    }

    return initialUser;
  });
  const storedUser = useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUserSnapshot,
    () => initialUser
  );
  const logOut = useActiveFetcher<void>({ url: 'auth/logout', method: 'POST' });

  const registerInfo = useCallback((newUser: UserResponseDTO) => {
    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    setServerSession(newUser);
  }, []);

  const deleteInfo = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    clearServerSession();
    await logOut.fetch();
  }, [logOut]);

  const resolvedUser = useMemo(() => {
    if (!user) {
      return storedUser;
    }

    if (!storedUser || user.id !== storedUser.id) {
      return user;
    }

    const missingStore = !user.store && !!storedUser.store;
    const missingClient = !user.client && !!storedUser.client;

    if (missingStore || missingClient) {
      return storedUser;
    }

    return user;
  }, [storedUser, user]);

  const getCurrentUser = useCallback((): UserResponseDTO | null => {
    if (!resolvedUser) return null;
    if (isExpired(resolvedUser)) {
      void deleteInfo();
      return null;
    }
    return resolvedUser;
  }, [resolvedUser, deleteInfo]);

  const value = useMemo(
    () => ({ getCurrentUser, registerInfo, deleteInfo }),
    [getCurrentUser, registerInfo, deleteInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the AuthContext. Must be used inside an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
