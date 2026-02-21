import { LngLatBounds } from 'maplibre-gl';
import { Store } from '../types';

export async function getStoresInBoundingBox(boundingBox: LngLatBounds): Promise<Store[]> {
  const sw = boundingBox.getSouthWest();
  const ne = boundingBox.getNorthEast();

  const minLng = sw.lng;
  const maxLng = ne.lng;
  const minLat = sw.lat;
  const maxLat = ne.lat;

  const stores: Store[] = [];

  for (let i = 0; i < 20; i++) {
    const randomLng = minLng + Math.random() * (maxLng - minLng);
    const randomLat = minLat + Math.random() * (maxLat - minLat);

    stores.push({
      name: `Store ${i + 1}`,
      location: { lng: randomLng, lat: randomLat },
    });
  }

  return stores;
}
