export type OutfitProduct = {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  priceInCents: number;
  type: string;
  index: number;
  storeId: number;
};

export type Outfit = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  discountedPriceInCents: number;
  index: number;
  storefrontId: number;
  tags: string[];
  products: OutfitProduct[];
};
