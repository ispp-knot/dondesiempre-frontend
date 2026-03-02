'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStoreById } from '@/lib/api/stores/getStoreById';
import StoreView from './store-view';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import ErrorText from '@/components/dondeSiempre/ErrorText';

export default function StorefrontPage() {
  const params = useParams<{ id: string }>();
  const storeId = params.id;

  const {
    data: store,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStoreById(storeId),
  });

  if (isLoading) {
    return <LoadingText />;
  }

  if (error || !store) {
    return <ErrorText error={error} />;
  }

  return <StoreView store={store} />;
}
