'use client';

import type { UserInfo } from '@/lib/types/auth';
import { pick } from 'lodash';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import useFetcher from '../api/fetcher';

const LOCAL_STORAGE_KEY = 'auth_user';

/**
 * Sets the non-HttpOnly "session" cookie.
 *
 * This is intentionally unsigned and not verified — use only for routing
 * decisions (guards), never for security-critical logic.
 */
export async function setServerSession(user: UserInfo) {
  const { expiresAt } = user;

  const cookie = btoa(JSON.stringify(pick(user, ['id', 'email', 'roles', 'expiresAt'])));
  document.cookie = `session=${cookie}; expires=${expiresAt}`;
}

/**
 * Clears the non-HttpOnly "session" cookie.
 *
 * This is intentionally unsigned and not verified — use only for routing
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
  getCurrentUser: () => UserInfo | null;

  /**
   * Persists the given UserInfo to state and localStorage.
   * Call this after a successful /login or /me response.
   */
  registerInfo: (user: UserInfo) => void;

  /**
   * Clears the auth state from memory and localStorage.
   * Does NOT contact the backend — you must call your logout endpoint separately.
   */
  deleteInfo: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readFromStorage(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserInfo;

    // Drop the stored value if the token has already expired.
    if (new Date(parsed.expiresAt) <= new Date()) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(readFromStorage());
  const logOut = useFetcher<void, void>({ url: 'auth/logout', method: 'GET', fetchOnStart: false });

  const registerInfo = useCallback((newUser: UserInfo) => {
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

  const getCurrentUser = useCallback((): UserInfo | null => {
    // Re-check expiry on every call so a long-lived session is evicted lazily.
    if (!user) return null;
    if (new Date(user.expiresAt) <= new Date()) {
      deleteInfo();
      return null;
    }
    return user;
  }, [user, deleteInfo]);

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
