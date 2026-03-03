export type StoreSocialNetworkDTO = {
  name: string;
  link: string;
};

export type StorefrontDTO = {
  id: string;
  isFirstCollections: boolean;
  primaryColor: string;
  secondaryColor: string;
  bannerImageUrl: string | null;
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
  socialNetworks?: SocialNetworkDTO[];
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

export type SocialNetworkDTO = {
  name: string;
  link: string;
};
