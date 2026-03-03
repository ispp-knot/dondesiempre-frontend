import { LngLat, LngLatBounds } from 'maplibre-gl';
import { Store, StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

const STORE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52C48A', // Green
];

export async function getStoresInBoundingBox(boundingBox: LngLatBounds): Promise<Store[]> {
  const sw = boundingBox.getSouthWest();
  const ne = boundingBox.getNorthEast();

  const minLng = sw.lng;
  const maxLng = ne.lng;
  const minLat = sw.lat;
  const maxLat = ne.lat;

  try {
    console.log(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/stores');
    const response = (await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/stores',
      {
        method: 'GET',
        query: {
          minLon: minLng,
          minLat: minLat,
          maxLon: maxLng,
          maxLat: maxLat,
        },
      }
    )) as StoreDTO[];
    return response.map((dto: StoreDTO, index: number) => ({
      id: dto.id,
      name: dto.name,
      address: dto.address,
      location: new LngLat(dto.longitude, dto.latitude),
      color: STORE_COLORS[index % STORE_COLORS.length],
      rating: 4.5,
      imageUrl: '/store-placeholder.jpeg',
    }));
  } catch (error) {
    console.error('Error fetching stores: ' + error);
    return [];
  }
}