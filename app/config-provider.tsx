'use client';

import { initClientConfig } from '@/lib/config';

interface Props {
  backendUrl: string;
  webUrl: string;
  children: React.ReactNode;
}

export function ConfigProvider({ backendUrl, webUrl, children }: Props) {
  initClientConfig(backendUrl, webUrl);
  return <>{children}</>;
}
