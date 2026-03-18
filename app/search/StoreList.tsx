'use client';

import { useState, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { useDebounce } from 'use-debounce';
import { StoreCard } from '@/components/dondeSiempre/StoreCard';

export default function StoreList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get location on mount to allow personalized sorting from backend
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          console.warn('Location access denied or failed, using backend default sorting.');
        }
      );
    }
  }, []);

  // Build query params for the new fetcher
  const queryParams = new URLSearchParams();
  if (debouncedSearchQuery) queryParams.append('name', debouncedSearchQuery);
  if (userLocation) {
    queryParams.append('lat', userLocation.lat.toString());
    queryParams.append('lon', userLocation.lon.toString());
  }

  const { data: stores, isPending } = usePassiveFetcher<StoreDTO[]>({
    url: `stores?${queryParams.toString()}`,
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-white pb-24 sm:pb-0">
      <div className="p-4 sticky top-0 bg-white z-10">
        <div className="relative flex items-center w-full max-w-2xl mx-auto">
          <IoSearch className="absolute left-3 text-secondary text-xl" />
          <input
            type="text"
            placeholder="Buscar tienda por nombre..."
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 text-dark-blue font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 max-w-3xl mx-auto w-full">
        {isPending && !stores ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : stores && stores.length > 0 ? (
          <div className="flex flex-col gap-4 md:gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                userLocation={
                  userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-medium">No se encontraron tiendas</p>
            <p className="mt-2">Intenta buscar con otro nombre</p>
          </div>
        )}
      </div>
    </div>
  );
}
