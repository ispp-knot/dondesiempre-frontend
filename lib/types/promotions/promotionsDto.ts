import { ProductDTO } from '../products/productsDto';

export interface PromotionCreationDTO {
  name: string;
  discountPercentage: number;
  isActive: boolean;
  productIds: string[];
  storeId: string;
  description?: string;
}

export interface PromotionDTO {
  startDate: string;
  endDate: string;
  promotionImageUrl: string;
  id: string;
  name: string;
  discountPercentage: number;
  active: boolean;
  description: string;
  storeId: string;
  products: ProductDTO[];
}

export interface PromotionMockDTO {
  id: string;
  name: string;
  discountPercentage: number;
  isActive: boolean;
  description: string;
  storeId: string;
  products: string[];
}
