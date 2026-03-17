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
  hasActivePromotions: boolean;
  latitude: number;
  longitude: number;
  aboutUs: string | null;
  storefront: StorefrontDTO;
  socialNetworks: StoreSocialNetworkDTO[];
};

export interface ProductType {
  id: string;
  type: string;
}

export interface OutfitProductDTO {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  type: ProductType;
  index: number;
  storeId: string;
}

export interface OutfitDTO {
  id: string;
  name: string;
  description: string;
  image: string;
  priceInCents: number;
  discountedPriceInCents: number;
  index: number;
  storefrontId: number;
  tags: string[];
  products: OutfitProductDTO[];
}

export interface ProductDTO {
  name: string;
  priceInCents: number;
  image: string;
  discountedPriceInCents: number;
  description: string;
  typeId: string;
  storeId: string;
}

export interface Promotion {
  id: string;
  name: string;
  discountPercentage: number;
  isActive: boolean;
  description: string;
  image: string | null;
  storeId: string;
  productIds: string[];
}
