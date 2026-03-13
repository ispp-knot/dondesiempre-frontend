export type ProductDTO = {
  id: string;
  name: string;
  priceInCents: number;
  discountedPriceInCents: number;
  description: string | null;
  image: string | null;
  typeId: string;
  storeId: string;
};
