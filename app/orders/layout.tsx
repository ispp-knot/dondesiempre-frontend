'use client';

import { LoggedInGuard } from '@/components/guards/LoggedInGuard';

export default function Page({ children }: { children: React.ReactNode }) {
  return <LoggedInGuard>{children}</LoggedInGuard>;
}
