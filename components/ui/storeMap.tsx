import { Store } from '@/lib/api/types';
import {
  FullscreenControl,
  GeolocateControl,
  LngLat,
  Map,
  MapEvent,
  MapRef,
  Marker,
  NavigationControl,
} from '@vis.gl/react-maplibre';
import { createRef, useCallback, useState } from 'react';
import { StorePin } from './storePin';

import 'maplibre-gl/dist/maplibre-gl.css'; // Must be included in every map view
import { useMutation } from '@tanstack/react-query';
import { getStoresInBoundingBox } from '@/lib/api/stores/getStoresInBoundingBox';
import { DEFAULT_MAP_LOCATION, DEFAULT_MAP_STYLE } from '@/lib/mapUtils';
import { useDebouncedCallback } from 'use-debounce';

export function StoreMap({
  startingLocation = DEFAULT_MAP_LOCATION,
  onClickStore = () => {},
}: {
  startingLocation?: LngLat;
  onClickStore?: (store: Store) => void;
}) {
  const mapRef = createRef<MapRef>();

  const [stores, setStores] = useState<Store[] | undefined>();

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

  const pins = stores?.map((store, index) => (
    <Marker
      key={`store-${index}`}
      longitude={store.location.lng}
      latitude={store.location.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClickStore(store);
      }}
    >
      <StorePin store={store} />
    </Marker>
  ));

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: startingLocation.lng,
        latitude: startingLocation.lat,
        zoom: 13,
      }}
      style={{ width: 600, height: 400 }}
      mapStyle={DEFAULT_MAP_STYLE}
      onLoad={fetchStores}
      onMoveEnd={debouncedFetchStores}
    >
      <GeolocateControl position="top-left" showUserLocation />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />

      {}

      {pins}
    </Map>
  );
}
