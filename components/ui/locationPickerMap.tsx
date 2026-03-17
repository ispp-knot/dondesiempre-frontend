'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Marker, MapRef } from '@vis.gl/react-maplibre';
import type { MarkerDragEvent } from '@vis.gl/react-maplibre';
import { Button } from '@/components/ui/button';
import { MdMyLocation } from 'react-icons/md';
import { Plus, Minus } from 'lucide-react';
import { DEFAULT_MAP_LOCATION, DEFAULT_MAP_STYLE } from '@/lib/mapUtils';

import 'maplibre-gl/dist/maplibre-gl.css';

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  const mapRef = useRef<MapRef>(null);

  const initialLat = latitude ?? DEFAULT_MAP_LOCATION.lat;
  const initialLng = longitude ?? DEFAULT_MAP_LOCATION.lng;

  const [marker, setMarker] = useState({ latitude: initialLat, longitude: initialLng });
  const [hasMarker, setHasMarker] = useState(latitude != null && longitude != null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
        setMarker({ latitude: lat, longitude: lng });
        setHasMarker(true);
        onChange(lat, lng);
      },
      () => {
        // Permission denied or unavailable — stay on default location, no marker
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMarkerDrag = useCallback(
    (event: MarkerDragEvent) => {
      const { lat, lng } = event.lngLat;
      setMarker({ latitude: lat, longitude: lng });
      onChange(lat, lng);
    },
    [onChange]
  );

  const handleMapClick = useCallback(
    (event: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = event.lngLat;
      setMarker({ latitude: lat, longitude: lng });
      setHasMarker(true);
      onChange(lat, lng);
    },
    [onChange]
  );

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
        setMarker({ latitude: lat, longitude: lng });
        setHasMarker(true);
        onChange(lat, lng);
      });
    }
  };

  return (
    <div className="relative w-full h-64 rounded-md overflow-hidden border border-input">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialLng,
          latitude: initialLat,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={DEFAULT_MAP_STYLE}
        onClick={handleMapClick}
        cursor="crosshair"
      >
        {hasMarker && (
          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            draggable
            onDrag={onMarkerDrag}
          >
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md" />
              <div className="w-0.5 h-3 bg-primary" />
            </div>
          </Marker>
        )}
      </Map>

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <div className="bg-background/80 backdrop-blur rounded-md p-0.5 shadow">
          <Button variant="ghost" size="icon" type="button" onClick={handleGeolocate}>
            <MdMyLocation size={20} />
          </Button>
        </div>
        <div className="flex flex-col gap-0.5 bg-background/80 backdrop-blur rounded-md p-0.5 shadow">
          <Button variant="ghost" size="icon" type="button" onClick={handleZoomIn}>
            <Plus size={18} strokeWidth={3} />
          </Button>
          <Button variant="ghost" size="icon" type="button" onClick={handleZoomOut}>
            <Minus size={18} strokeWidth={3} />
          </Button>
        </div>
      </div>

      {!hasMarker && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs text-muted-foreground bg-background/70 backdrop-blur px-2 py-1 rounded">
            Haz clic en el mapa para seleccionar la ubicación
          </p>
        </div>
      )}
    </div>
  );
}
