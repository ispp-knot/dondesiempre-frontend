import { LngLat } from '@vis.gl/react-maplibre';
import { NIL as NIL_UUID } from 'uuid';

export type StoreSocialNetworkDTO = {
  name: string;
  link: string;
};

export type StorefrontDTO = {
  id: typeof NIL_UUID;
  isFirstCollections: boolean;
  primaryColor: string;
  secondaryColor: string;
  bannerImageUrl: string | null;
};


export type Store = {
  id: typeof NIL_UUID;
  name: string;
  location: LngLat;
  color: string;
  address: string;
  rating: number;
  email?: string;
  openingHours?: string;
  phone?: string;
  acceptsShipping?: boolean;
  imageUrl?: string;
};

export type StoreDTO = {
  id: typeof NIL_UUID;
  name: string;
  email: string;
  storeID: typeof NIL_UUID;
  address: string;
  openingHours: string;
  phone: string;
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
};