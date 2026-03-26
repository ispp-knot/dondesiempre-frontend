'use client';

import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { StoreCard } from '@/components/dondeSiempre/StoreCard';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { useAuth } from '@/lib/auth/AuthContext';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { useUserLocation } from '@/lib/useGeolocation';
import { JSX } from 'react';

export default function FollowPage(): JSX.Element {
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const followedStores = usePassiveFetcher<StoreDTO[]>({
    url: `clients/${user?.client?.id}/following`,
    enabled: !!user?.client?.id,
  });

  const userLocation = useUserLocation();

  if (followedStores.isLoading) {
    return <LoadingText></LoadingText>;
  }

  if (followedStores.isError) {
    return <ErrorView />;
  }

  const stores = followedStores.data;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Tiendas seguidas</h1>
        </header>

        {(!stores || stores.length === 0) && (
          <NotFoundText message="No sigues ninguna tienda."></NotFoundText>
        )}

        <div className="grid grid-cols-1 wide:grid-cols-2 gap-4 wide:gap-6">
          {stores?.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : null}
              onUnfollow={() => {
                followedStores.setData(stores.filter((s) => s.id !== store.id));
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
