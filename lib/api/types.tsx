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
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
  aboutUs: string | null;
  storefront: StorefrontDTO;
  socialNetworks: StoreSocialNetworkDTO[];
};
