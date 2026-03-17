import { Button } from '@/components/ui/button';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { LngLat, Map, MapEvent, MapRef, Marker } from '@vis.gl/react-maplibre';
import { Minus, Plus } from 'lucide-react';
import { createRef, useCallback } from 'react';
import { MdMyLocation } from 'react-icons/md';
import { TbNavigationNorth } from 'react-icons/tb';
import { StorePin } from './storePin';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { DEFAULT_MAP_LOCATION, DEFAULT_MAP_STYLE } from '@/lib/mapUtils';
import 'maplibre-gl/dist/maplibre-gl.css'; // Must be included in every map view
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
  const stores = useActiveFetcher<StoreDTO[]>({ url: 'stores', method: 'GET' });

  const fetchStores = useCallback(
    async (_: MapEvent) => {
      const boundary = mapRef.current?.getBounds();

      if (!boundary) {
        return;
      }
      const sw = boundary.getSouthWest();
      const ne = boundary.getNorthEast();

      await stores.fetch({
        url: `stores?minLon=${sw.lng}&maxLon=${ne.lng}&minLat=${sw.lat}&maxLat=${ne.lat}`,
      });
    },
    [mapRef, stores]
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

  const pins = stores.data?.map((store, index) => (
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
    <div className="relative flex flex-1">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: startingLocation.lng,
          latitude: startingLocation.lat,
          zoom: 13,
        }}
        style={{ display: 'flex', flex: 1, height: 'auto' }}
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
            <TbNavigationNorth size={30} />
          </Button>
        </div>
      </div>
    </div>
  );
}
