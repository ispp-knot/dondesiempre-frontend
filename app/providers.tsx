'use client';

import type { UserResponseDTO } from '@/lib/types/auth/authDto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';

const queryClient = new QueryClient();

export function Providers({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserResponseDTO | null;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
