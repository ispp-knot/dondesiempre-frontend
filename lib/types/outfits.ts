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

export type OutfitCreationProduct = {
  id: number;
  index: number;
};

export type OutfitCreation = {
  index: number;
  storefrontId: number;
  name: string;
  description: string | null;
  image: string | null;
  tags: string[];
  products: OutfitCreationProduct[];
};

export type OutfitUpdate = {
  name: string;
  description: string | null;
  image: string | null;
  discountedPriceInCents: number;
  index: number;
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
