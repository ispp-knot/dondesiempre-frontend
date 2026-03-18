'use client';

import { usePassiveFetcher } from '@/lib/api/fetcher';

export function HealthCheck() {
  const health = usePassiveFetcher({ url: 'health' });

  if (health.isLoading) {
    return <>Loading...</>;
  }

  if (health.isError) {
    return <>Server is offline :(</>;
  }

  return <>Server is online! :)</>;
}
