'use client';

import type { UserResponseDTO } from '@/lib/types/auth/authDto';
import { pick } from 'lodash';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useActiveFetcher } from '../api/fetcher';

const LOCAL_STORAGE_KEY = 'auth_user';

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

function readFromStorage(): UserResponseDTO | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserResponseDTO;

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
  const [user, setUser] = useState<UserResponseDTO | null>(readFromStorage());
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

  const getCurrentUser = useCallback((): UserResponseDTO | null => {
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
