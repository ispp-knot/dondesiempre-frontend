import { getBackendUrl } from '@/lib/config';
import { LngLatBounds } from 'maplibre-gl';
import { StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getStoresInBoundingBox(boundingBox: LngLatBounds): Promise<StoreDTO[]> {
  const sw = boundingBox.getSouthWest();
  const ne = boundingBox.getNorthEast();

  const minLng = sw.lng;
  const maxLng = ne.lng;
  const minLat = sw.lat;
  const maxLat = ne.lat;

  try {
    return (await authorizedOfetch(getBackendUrl() + '/api/v1/stores', {
      method: 'GET',
      query: {
        minLon: minLng,
        minLat: minLat,
        maxLon: maxLng,
        maxLat: maxLat,
      },
    })) as StoreDTO[];
  } catch (error) {
    console.error('Error fetching stores: ' + error);
    return [];
  }
}
