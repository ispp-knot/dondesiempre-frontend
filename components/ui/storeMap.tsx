import { StoreDTO } from '@/lib/api/types';
import { LngLat, Map, MapEvent, MapRef, Marker } from '@vis.gl/react-maplibre';
import { createRef, useCallback, useState } from 'react';
import { StorePin } from './storePin';
import { Button } from '@/components/ui/button';
import { MdMyLocation, MdExplore } from 'react-icons/md';
import { Plus, Minus } from 'lucide-react';

import 'maplibre-gl/dist/maplibre-gl.css'; // Must be included in every map view
import { useMutation } from '@tanstack/react-query';
import { getStoresInBoundingBox } from '@/lib/api/stores/getStoresInBoundingBox';
import { DEFAULT_MAP_LOCATION, DEFAULT_MAP_STYLE } from '@/lib/mapUtils';
import { useDebouncedCallback } from 'use-debounce';

export function StoreMap({
  startingLocation = DEFAULT_MAP_LOCATION,
  userLocation,
  onClickStore = () => {},
  onStoreSelect,
}: {
  startingLocation?: LngLat;
  userLocation?: { lng: number; lat: number } | null;
  onClickStore?: (store: StoreDTO) => void;
  onStoreSelect?: (store: StoreDTO | null) => void;
}) {
  const mapRef = createRef<MapRef>();

  const [stores, setStores] = useState<StoreDTO[] | undefined>();

  const { mutate: getStores } = useMutation({
    mutationFn: getStoresInBoundingBox,
  });

  const fetchStores = useCallback(
    (_: MapEvent) => {
      const boundary = mapRef.current?.getBounds();
      if (!boundary) return;
      getStores(boundary, {
        onSuccess: setStores,
        onError: () => setStores(undefined),
      });
    },
    [mapRef, getStores]
  );

  const debouncedFetchStores = useDebouncedCallback(fetchStores, 100);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetNorth = () => {
    mapRef.current?.resetNorth();
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15,
        });
      });
    }
  };

  const pins = stores?.map((store, index) => (
    <Marker
      key={`store-${index}`}
      longitude={store.longitude}
      latitude={store.latitude}
      anchor="bottom"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={(e: any) => {
        e.originalEvent.stopPropagation();
        onStoreSelect?.(store);
        onClickStore(store);
      }}
    >
      <StorePin store={store} />
    </Marker>
  ));

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: startingLocation.lng,
          latitude: startingLocation.lat,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={DEFAULT_MAP_STYLE}
        onLoad={fetchStores}
        onMoveEnd={debouncedFetchStores}
        onClick={() => onStoreSelect?.(null)}
      >
        {pins}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-50 animate-ping"></div>
              <div className="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Custom Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-background/80 backdrop-blur rounded-md p-1 shadow-lg">
          <Button variant="ghost" size="icon" onClick={handleGeolocate}>
            <MdMyLocation size={30} />
          </Button>
        </div>
        <div className="flex flex-col gap-1 bg-background/80 backdrop-blur rounded-md p-1 shadow-lg">
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <Plus size={30} strokeWidth={3} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <Minus size={30} strokeWidth={3} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleResetNorth}>
            <MdExplore size={30} />
          </Button>
        </div>
      </div>
    </div>
  );
}
