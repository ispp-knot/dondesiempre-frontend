import { LngLat, LngLatBounds } from 'maplibre-gl';
import { Store } from '../types';

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

const STORE_NAMES = [
  'Boutique Elegancia',
  'Moda María',
  'El Armario',
  'Vestidos Luna',
  'Boutique Chic',
  'Moda Isabel',
  'La Percha',
  'Estilo Propio',
  'Boutique del Sol',
  'El Vestidor',
  'Moda y Clase',
  'Tendencias',
  'Boutique Ana',
  'Ropa Linda',
  'Moda Urbana',
  'La Boutique Carmen',
  'Estilo y Moda',
  'Boutique Moderna',
  'Ropa y Estilo',
  'Moda Express',
];

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
      name: STORE_NAMES[i % STORE_NAMES.length],
      location: new LngLat(randomLng, randomLat),
      color: STORE_COLORS[i % STORE_COLORS.length],
      address: `${Math.floor(Math.random() * 1000) + 1} Main Street, City`,
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // Random rating between 1.0 and 5.0
    });
  }

  return stores;
}
