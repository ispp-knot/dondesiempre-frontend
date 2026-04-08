export interface OutfitTagDTO {
  name: string;
}

export interface OutfitDTO {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountPercentage?: number | null;
  index: number;
  storeId: string;
  tags: OutfitTagDTO[];
  products: OutfitProductDTO[];
}

export interface OutfitProductDTO {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountPercentage: number | null;
  typeId: string;
  index: number;
  storeId: string;
}

export interface OutfitCreationProductDTO {
  productId: string;
  index: number;
}

export interface OutfitCreationDTO {
  storefrontId: string;
  name: string;
  description: string | null;
  discountPercentage?: number | null;
  tags: OutfitTagDTO[];
  products: OutfitCreationProductDTO[];
}

export interface OutfitUpdateDTO {
  name: string;
  description: string | null;
  discountPercentage: number | null;
}

export interface OutfitSortDTO {
  id: string;
  index: number;
}
