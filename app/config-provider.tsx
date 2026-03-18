'use client';

import { initClientConfig } from '@/lib/config';

interface Props {
  backendUrl: string;
  webUrl: string;
  children: React.ReactNode;
  dirBack: string;
}

export function ConfigProvider({ backendUrl, webUrl, dirBack, children }: Props) {
  initClientConfig(backendUrl, webUrl, dirBack);
  return <>{children}</>;
}
