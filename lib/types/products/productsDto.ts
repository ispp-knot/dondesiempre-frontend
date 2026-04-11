export interface ProductDTO {
  id: string;
  name: string;
  priceInCents: number;
  discountPercentage: number | null;
  description: string | null;
  image: string | null;
  typeId: string;
  storeId: string;
}

export interface ProductCreationDTO {
  name: string;
  priceInCents: number;
  description: string | null;
  typeId: string;
}

export interface ProductSize {
  id: string;
  name: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
}

export interface ProductVariantBackendDTO {
  id: string;
  productId: string;
  sizeId: string;
  colorId: string;
  isAvailable: boolean;
}
