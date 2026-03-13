export type OutfitDTO = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountedPriceInCents: number;
  index: number;
  storefrontId: number; // TODO: En rama Pepe: storeId
  tags: string[];
  products: OutfitProductDTO[];
};

export type OutfitProductDTO = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountedPriceInCents: number;
  typeId: string;
  index: number;
  storeId: string;
};

export type OutfitCreationProductDTO = {
  productId: string;
  index: number;
};

export type OutfitCreationDTO = {
  index: number;
  storefrontId: string;
  name: string;
  description: string | null;
  tags: string[];
  products: OutfitCreationProductDTO[];
};

export type OutfitUpdateDTO = {
  name: string;
  description: string | null;
  discountedPriceInCents: number;
  index: number;
};
