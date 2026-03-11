'use client';

import useFetcher from '@/lib/api/fetcher';

export function HealthCheck() {
  const health = useFetcher<void>({ url: 'health' });

  if (health.isLoading) {
    return <>Loading...</>;
  }

  if (health.isError) {
    return <>Server is offline :(</>;
  }
  return <>Server is online! :)</>;
}
