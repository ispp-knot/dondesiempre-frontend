'use client';

import { getHealth } from '@/lib/api/getHealth';
import { useQuery } from '@tanstack/react-query';

export function HealthCheck() {
  const healthCheckQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  if (healthCheckQuery.isLoading) {
    return <>Loading...</>;
  }

  if (healthCheckQuery.error) {
    return <>Error! {healthCheckQuery.error.message}</>;
  }

  if (healthCheckQuery.data == false) {
    return <>Server is offline :c</>;
  } else {
    return <>Server is online! c:</>;
  }
}
