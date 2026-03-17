'use client';

import { useState, useEffect, useCallback } from 'react';
import { IoSearch } from 'react-icons/io5';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { StoreDTO } from '@/lib/api/types';
import { searchStores } from '@/lib/api/stores/searchStores';
import { useDebouncedCallback } from 'use-debounce';
import { BadgePercent } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Sevilla coords: lat 37.3891, lon -5.9845
const DEFAULT_LAT = 37.3891;
const DEFAULT_LON = -5.9845;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StoreList() {
  const [stores, setStores] = useState<StoreDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const fetchStores = useCallback(
    async (query: string, location: { lat: number; lon: number } | null) => {
      setLoading(true);
      const data = await searchStores(query, location?.lat, location?.lon);
      setStores(data);
      setLoading(false);
    },
    []
  );

  const debouncedFetch = useDebouncedCallback(
    (query: string, location: { lat: number; lon: number } | null) => {
      fetchStores(query, location);
    },
    300
  );

  useEffect(() => {
    async function init() {
      let loc: { lat: number; lon: number } | null = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          loc = { lat: position.coords.latitude, lon: position.coords.longitude };
          setUserLocation(loc);
        } catch (_error) {
          console.warn('Location access denied or failed, using backend default sorting.');
        }
      }
      fetchStores('', loc);
    }
    init();
  }, [fetchStores]);

  useEffect(() => {
    debouncedFetch(searchQuery, userLocation);
  }, [searchQuery, userLocation, debouncedFetch]);

  const sortedAndFilteredStores = stores;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white pb-24 sm:pb-0">
      <div className="p-4 sticky top-0 bg-white z-10 shadow-sm">
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

      <div className="flex-1 overflow-y-auto px-4 py-2 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sortedAndFilteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAndFilteredStores.map((store) => {
              const distance = calculateDistance(
                userLocation?.lat ?? DEFAULT_LAT,
                userLocation?.lon ?? DEFAULT_LON,
                store.latitude,
                store.longitude
              ).toFixed(1);

              return (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="relative flex flex-row items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 mr-4 flex-shrink-0">
                    {store.storefront?.bannerImageUrl ? (
                      <Image
                        src={store.storefront.bannerImageUrl}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                        <HiOutlineLocationMarker size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-dark-blue group-hover:text-primary transition-colors pr-8">
                        {store.name}
                      </h3>
                      {store.hasActivePromotions && (
                        <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1.5 rounded-full shadow-sm">
                          <BadgePercent size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{store.address}</p>
                    {userLocation && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                          {distance} km
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
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
