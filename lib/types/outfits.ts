import { Product } from './products';
import { NIL as NIL_UUID } from 'uuid';

export type OutfitProduct = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceInCents: number;
  type: string;
  index: number;
  storeId: string;
};

export type Outfit = {
  id: string;
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
  id: string;
  index: number;
};

export type OutfitCreation = {
  index: number;
  storefrontId: string;
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
    id: NIL_UUID,
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

export function productToOufitCreationProduct(
  product: Product,
  index: number
): OutfitCreationProduct {
  return {
    id: product.id,
    index: index,
  };
}
