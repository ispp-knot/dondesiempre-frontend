import { LngLat } from '@vis.gl/react-maplibre';

export type Store = {
  name: string;
  location: LngLat;
  color: string;
  address: string;
  rating: number;
  imageUrl?: string;
};

export type StoreDTO = {
  id: number;
  name: string;
  email: string;
  storeID: string;
  address: string;
  openingHours: string;
  phone: string;
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
};