export type OutfitProduct = {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  discountedPriceInCents: number;
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

export function createEmptyOutfit(): Outfit {
  return {
    id: 0,
    name: '',
    description: null,
    image: null,
    priceInCents: 0,
    discountedPriceInCents: 0,
    index: 0,
    storefrontId: 0,
    tags: [],
    products: [],
  };
}
