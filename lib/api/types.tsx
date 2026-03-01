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
  id: string;
  name: string;
  email: string;
  storeID: string;
  address: string;
  openingHours: string;
  phone: string;
  aboutUs: string;
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
  storefrontId: string;
  isFirstCollections: boolean;
  primaryColor: string;
  secondaryColor: string;
  bannerImageUrl: string;
};

export type OutfitProductDTO = {
  id: string;
  name: string;
  description: string;
  image: string;
  priceInCents: number;
  type: string;
  index: number;
};

export type OutfitDTO = {
  id: string;
  name: string;
  description: string;
  image: string;
  priceInCents: number;
  discountedPriceInCents: number;
  index: number;
  tags: string[];
  products: string[];
};
