export interface OutfitDTO {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountedPriceInCents: number;
  index: number;
  storeId: string;
  tags: string[];
  products: OutfitProductDTO[];
}

export interface OutfitProductDTO {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountedPriceInCents: number;
  typeId: string;
  index: number;
  storeId: string;
}

export interface OutfitCreationProductDTO {
  productId: string;
  index: number;
}

export interface OutfitCreationDTO {
  index: number;
  storefrontId: string;
  name: string;
  description: string | null;
  tags: string[];
  products: OutfitCreationProductDTO[];
}

export interface OutfitUpdateDTO {
  name: string;
  description: string | null;
  discountedPriceInCents: number;
  index: number;
}
