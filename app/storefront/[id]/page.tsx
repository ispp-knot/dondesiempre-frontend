'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStoreById } from '@/lib/api/stores/getStoreById';
import StoreView from './store-view';

export default function StorefrontPage() {
  const params = useParams<{ id: string }>();
  const storeId = params.id;

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStoreById(storeId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando tienda...</p>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
        <p className="text-destructive font-semibold text-lg">No se pudo cargar la tienda.</p>
        <p className="text-muted-foreground text-sm mt-1">Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  return <StoreView store={store} />;
}
