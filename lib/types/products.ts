export type Product = {
  id: number;
  name: string;
  priceInCents: number;
  discountedPriceInCents: number;
  description: string | null;
  type: string;
  storeId: number;
};
