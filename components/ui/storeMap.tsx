import { Button } from '@/components/ui/button';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { LngLat, Map, MapEvent, MapRef, Marker } from '@vis.gl/react-maplibre';
import { Minus, Plus } from 'lucide-react';
import { useCallback, useReducer, useRef, useState, useMemo } from 'react';
import { MdMyLocation } from 'react-icons/md';
import { TbNavigationNorth } from 'react-icons/tb';
import { StorePin } from './storePin';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { DEFAULT_MAP_LOCATION, DEFAULT_MAP_STYLE } from '@/lib/mapUtils';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDebouncedCallback } from 'use-debounce';
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster';

type StoreProperties = { store: StoreDTO };

type ClusterPin =
  | { type: 'cluster'; id: number; lng: number; lat: number; count: number; expansionZoom: number }
  | { type: 'point'; lng: number; lat: number; store: StoreDTO };

function ClusterMarker({ count, onClick }: { count: number; onClick: () => void }) {
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;
  const fontSize = count < 10 ? 13 : count < 50 ? 14 : 15;

  return (
    <button
      onClick={onClick}
      style={{ width: size, height: size, fontSize }}
      className="
        flex items-center justify-center rounded-full font-bold text-white
        bg-primary shadow-lg border-2 border-white
        hover:scale-110 active:scale-95
        transition-transform duration-150 cursor-pointer
        select-none
      "
    >
      {count}
    </button>
  );
}

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
  const mapRef = useRef<MapRef | null>(null);
  const stores = useActiveFetcher<StoreDTO[]>({ url: 'stores', method: 'GET' });

  const [viewport, setViewport] = useState({
    zoom: 13,
    bounds: [-180, -90, 180, 90] as [number, number, number, number],
  });

  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  const debouncedForceUpdate = useDebouncedCallback(forceUpdate, 50);

  const supercluster = useMemo(() => {
    if (!stores.data?.length) return null;

    const sc = new Supercluster<StoreProperties>({ radius: 60, maxZoom: 16 });

    const points: PointFeature<StoreProperties>[] = stores.data.map((store) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [store.longitude, store.latitude] },
      properties: { store },
    }));

    sc.load(points);
    return sc;
  }, [stores.data]);

  const clusterPins = useMemo((): ClusterPin[] => {
    if (!supercluster) return [];

    const zoom = Math.round(viewport.zoom);
    const clusters = supercluster.getClusters(viewport.bounds, zoom);

    return clusters.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;

      if ('cluster' in feature.properties && feature.properties.cluster) {
        const cf = feature as ClusterFeature<StoreProperties>;
        return {
          type: 'cluster',
          id: cf.properties.cluster_id,
          lng,
          lat,
          count: cf.properties.point_count,
          expansionZoom: supercluster.getClusterExpansionZoom(cf.properties.cluster_id),
        };
      }

      const pf = feature as PointFeature<StoreProperties>;
      return {
        type: 'point',
        lng,
        lat,
        store: pf.properties.store,
      };
    });
  }, [supercluster, viewport]);

  const fetchStores = useCallback(
    async (_: MapEvent) => {
      const boundary = mapRef.current?.getBounds();
      if (!boundary) return;
      const sw = boundary.getSouthWest();
      const ne = boundary.getNorthEast();

      await stores.fetch({
        url: `stores?minLon=${sw.lng}&maxLon=${ne.lng}&minLat=${sw.lat}&maxLat=${ne.lat}`,
      });
    },
    [mapRef, stores]
  );

  const debouncedFetchStores = useDebouncedCallback(fetchStores, 100);

  const syncViewport = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    if (!bounds) return;

    setViewport({
      zoom,
      bounds: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
    });

    debouncedForceUpdate();
  }, [debouncedForceUpdate]);

  const debouncedSyncViewport = useDebouncedCallback(syncViewport, 50);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetNorth = () => mapRef.current?.resetNorth();

  const handleGeolocate = () => {
    const loc = userLocation || DEFAULT_MAP_LOCATION;
    mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
  };

  const handleClusterClick = (pin: Extract<ClusterPin, { type: 'cluster' }>) => {
    mapRef.current?.flyTo({
      center: [pin.lng, pin.lat],
      zoom: pin.expansionZoom,
    });
  };

  const markers = clusterPins.map((pin, index) => {
    if (pin.type === 'cluster') {
      return (
        <Marker key={`cluster-${pin.id}`} longitude={pin.lng} latitude={pin.lat} anchor="center">
          <ClusterMarker count={pin.count} onClick={() => handleClusterClick(pin)} />
        </Marker>
      );
    }

    return (
      <Marker
        key={`store-${pin.store.id ?? index}`}
        longitude={pin.lng}
        latitude={pin.lat}
        anchor="bottom"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(e: any) => {
          e.originalEvent.stopPropagation();
          onStoreSelect?.(pin.store);
          onClickStore(pin.store);
        }}
      >
        <StorePin store={pin.store} />
      </Marker>
    );
  });

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
        onLoad={(e) => {
          syncViewport();
          fetchStores(e);
        }}
        onMove={debouncedSyncViewport}
        onMoveEnd={(e) => {
          syncViewport();
          debouncedFetchStores(e);
        }}
        onClick={() => onStoreSelect?.(null)}
      >
        {markers}

        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-50 animate-ping" />
              <div className="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md" />
            </div>
          </Marker>
        )}
      </Map>

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
