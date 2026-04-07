'use client';

import { StoreMap } from '@/components/ui/storeMap';
import { StoreCard } from '@/components/dondeSiempre/StoreCard';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { LngLat } from 'maplibre-gl';
import { DEFAULT_MAP_LOCATION } from '@/lib/mapUtils';

export function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<StoreDTO | null>(null);
  const [startingLocation, setStartingLocation] = useState<LngLat | null>(null);
  const [userLocation, setUserLocation] = useState<LngLat | null>(null);

  useEffect(() => {
    const applyDefault = () => {
      setTimeout(() => setStartingLocation(DEFAULT_MAP_LOCATION), 0);
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = new LngLat(position.coords.longitude, position.coords.latitude);
          setStartingLocation((prev) => (prev === null ? coords : prev));
          setUserLocation(coords);
        },
        (error) => {
          console.warn('Usando Dos Hermanas por defecto.', error.message);
          applyDefault();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.warn('Geolocalización no soportada por el navegador.');
      applyDefault();
    }
  }, []);

  if (!startingLocation) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Buscando tu ubicación...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1">
      <StoreMap
        startingLocation={startingLocation}
        userLocation={userLocation}
        onStoreSelect={setSelectedStore}
      />
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            key={selectedStore.id}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ bottom: 'env(safe-area-inset-bottom)' }}
            className="absolute left-0 right-0 md:bottom-4 md:w-[90%] md:max-w-2xl mx-auto"
          >
            <StoreCard
              store={selectedStore}
              userLocation={userLocation}
              className="rounded-b-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
