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
  aboutUs: string | null;
  storefront: StorefrontDTO;
  socialNetworks: StoreSocialNetworkDTO[];
  //TODO: En rama Claudia: Añadir isFirstCollections, primaryColor, secondaryColor, bannerImageUrl
};
