'use client';

import { StoreGuard } from '@/components/guards/StoreGuard';

export default function Page({ children }: { children: React.ReactNode }) {
  return <StoreGuard>{children}</StoreGuard>;
}
