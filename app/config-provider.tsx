'use client';

import { useEffect } from 'react';
import { notifyServiceWorker } from '@/lib/config';

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    notifyServiceWorker();
  }, []);
  return <>{children}</>;
}
