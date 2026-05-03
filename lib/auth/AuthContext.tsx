'use client';

import type { UserResponseDTO } from '@/lib/types/auth/authDto';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authorizedOfetch } from '../api/authorizedOfetch';
import { getBackendUrl } from '../config';

const LOCAL_STORAGE_KEY = 'auth_user_v2';
const AUTH_TOKEN_KEY = 'auth_token_v2';

const ONE_HOUR_MS = 60 * 60 * 1000;

interface AuthContextValue {
  /**
   * Returns the currently authenticated user, or null if not logged in
   * (or if the stored token expires within 1 hour).
   */
  getCurrentUser: () => UserResponseDTO | null;

  /**
   * Persists the given UserInfo to state and localStorage.
   * Call this after a successful /login response.
   */
  registerInfo: (user: UserResponseDTO, token: string) => void;

  /**
   * Clears the auth state from memory and localStorage.
   * Logout is now purely client-side — no backend call is made.
   */
  deleteInfo: () => void;

  /**
   * Returns the raw JWT from localStorage, or null if not present or near-expiry.
   * If the token is about to expire (within 1 hour), clears auth state and
   * redirects to /login.
   */
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readFromStorage(): UserResponseDTO | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserResponseDTO;

    // Drop the stored value if the token expires within 1 hour.
    if (new Date(parsed.expiresAt) <= new Date(Date.now() + ONE_HOUR_MS)) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDTO | null>(readFromStorage());
  const router = useRouter();

  const deleteInfo = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  const registerInfo = useCallback((newUser: UserResponseDTO, token: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(newUser);
  }, []);

  const redirectIfExpired = useCallback(
    (user: UserResponseDTO) => {
      if (new Date(user.expiresAt) <= new Date(Date.now() + ONE_HOUR_MS)) {
        deleteInfo();
        router.replace('/login');
        return true;
      }
      return false;
    },
    [deleteInfo, router]
  );

  const getCurrentUser = useCallback((): UserResponseDTO | null => {
    // Re-check expiry on every call so a long-lived session is evicted lazily.
    if (!user) return null;
    if (redirectIfExpired(user)) return null;
    return user;
  }, [user, redirectIfExpired]);

  const getAuthToken = useCallback((): string | null => {
    // Re-check expiry on every call so a long-lived session is evicted lazily.
    if (!user) return null;
    if (redirectIfExpired(user)) return null;

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    return token;
  }, [user, redirectIfExpired]);

  const value = useMemo(
    () => ({ getCurrentUser, registerInfo, deleteInfo, getAuthToken }),
    [getCurrentUser, registerInfo, deleteInfo, getAuthToken]
  );

  // Log you out if you're logged in but your user is invalid
  // (say if it got deleted)
  useEffect(() => {
    if (!user) return;

    authorizedOfetch(
      getBackendUrl() + '/api/v1/auth/me',
      undefined,
      localStorage.getItem(AUTH_TOKEN_KEY)
    ).catch(() => {
      deleteInfo();
      router.replace('/login');
    });
  }, [deleteInfo, getAuthToken, user, router]);

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
