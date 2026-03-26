'use client';

import { useEffect, useState } from 'react';

export function useUserLocation() {
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

  return userLocation;
}
