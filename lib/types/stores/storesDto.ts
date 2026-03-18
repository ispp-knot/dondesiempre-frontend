import { NIL as NIL_UUID } from 'uuid';

export interface StoreSocialNetworkDTO {
  name: string;
  link: string;
}

export interface StorefrontDTO {
  id: typeof NIL_UUID;
  isFirstCollections: boolean;
  primaryColor: string;
  secondaryColor: string;
  bannerImageUrl: string | null;
}

export interface StoreDTO {
  id: typeof NIL_UUID;
  name: string;
  email: string;
  storeID: typeof NIL_UUID;
  address: string;
  openingHours: string;
  phone: string;
  acceptsShipping: boolean;
  hasActivePromotions: boolean;
  latitude: number;
  longitude: number;
  aboutUs: string | null;
  // TODO: En Pr Claudia #64: Añadir isFirstCollections, primaryColor, secondaryColor, bannerImageUrl
  storefront: StorefrontDTO;
  socialNetworks: StoreSocialNetworkDTO[];
}
