export type Product = {
  id: string;
  name: string;
  priceInCents: number;
  discountedPriceInCents: number;
  description: string | null;
  image: string | null;
  type: string;
  storeId: string;
};
