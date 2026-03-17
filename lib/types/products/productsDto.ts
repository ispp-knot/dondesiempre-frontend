export interface ProductDTO {
  id: string;
  name: string;
  priceInCents: number;
  discountPercentage: number;
  description: string | null;
  image: string | null;
  typeId: string;
  storeId: string;
}
