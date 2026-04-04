'use client';

import { useState, useCallback, useEffect } from 'react';
import { Loader2, MapPin, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Map, Marker, ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { MdMyLocation } from 'react-icons/md';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { DEFAULT_MAP_LOCATION, DEFAULT_MAP_STYLE } from '@/lib/mapUtils';
import 'maplibre-gl/dist/maplibre-gl.css';

type StoreLocationModalProps = {
  storeId: string;
  initialLat?: number;
  initialLng?: number;
  onSavedAction: () => void;
};

export default function StoreLocationModal({
  storeId,
  initialLat,
  initialLng,
  onSavedAction,
}: StoreLocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [viewState, setViewState] = useState({
    longitude: initialLng ?? DEFAULT_MAP_LOCATION.lng,
    latitude: initialLat ?? DEFAULT_MAP_LOCATION.lat,
    zoom: 15,
  });

  const updateLocation = useActiveFetcher<void>({
    url: `stores/${storeId}/location`,
    method: 'PUT',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);

          if (!initialLat && !initialLng) {
            setViewState((prev) => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
          }
        },
        (error) => {
          console.warn('Geolocalización denegada o fallida.', error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOpen, initialLat, initialLng]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setApiError(null);
      setUserLocation(null);
      setViewState({
        longitude: initialLng ?? DEFAULT_MAP_LOCATION.lng,
        latitude: initialLat ?? DEFAULT_MAP_LOCATION.lat,
        zoom: 15,
      });
    }
  };

  const handleGeolocate = () => {
    if (userLocation) {
      setViewState((prev) => ({
        ...prev,
        longitude: userLocation.lng,
        latitude: userLocation.lat,
      }));
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewState((prev) => ({
            ...prev,
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          }));
        },
        () => setApiError('No se pudo obtener tu ubicación. Comprueba los permisos.')
      );
    }
  };

  const onMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  async function handleSave() {
    setApiError(null);

    try {
      await updateLocation.fetch({
        body: {
          latitude: viewState.latitude,
          longitude: viewState.longitude,
        },
      });

      setIsOpen(false);
      setUserLocation(null);
      onSavedAction();
    } catch {
      setApiError('No se pudo actualizar la ubicación.');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <MapPin className="w-5 h-5 mr-1" />
          Actualizar ubicación
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150 h-[90vh] sm:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 bg-background z-10 border-b">
          <DialogTitle className="text-xl font-bold text-center">
            Ubicación de la tienda
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Arrastra el mapa para situar tu tienda bajo el marcador central.
          </p>
        </DialogHeader>

        {/* CONTENEDOR DEL MAPA */}
        <div className="relative flex-1 bg-muted">
          <Map
            {...viewState}
            onMove={onMove}
            style={{ width: '100%', height: '100%' }}
            mapStyle={DEFAULT_MAP_STYLE}
          >
            {/* PIN AZUL DE USUARIO (Ubicación real por GPS) */}
            {userLocation && (
              <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-50 animate-ping"></div>
                  <div className="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
                </div>
              </Marker>
            )}
            {/* PIN CENTRAL (Fijo en el centro de la vista) */}
            <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor="bottom">
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                {/* Punta del pin */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-8 border-l-transparent border-r-transparent border-t-primary" />
              </div>
            </Marker>
          </Map>

          {/* BOTÓN FLOTANTE: Mi ubicación */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-md bg-background/90 backdrop-blur"
              onClick={handleGeolocate}
              title="Ir a mi ubicación"
            >
              <MdMyLocation className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>

        {/* PIE DEL MODAL (Botones) */}
        <div className="p-4 bg-background border-t z-10 flex flex-col gap-2">
          {apiError && <p className="text-xs text-destructive text-center">{apiError}</p>}
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={updateLocation.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>

            <Button onClick={handleSave} disabled={updateLocation.isPending}>
              {updateLocation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Confirmar ubicación
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
