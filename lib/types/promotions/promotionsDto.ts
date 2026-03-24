export interface PromotionCreationDTO {
  name: string;
  discountPercentage: number;
  isActive: boolean;
  productIds: string[];
  storeId: string;
  description?: string;
}

export interface PromotionDTO {
  id: string;
  name: string;
  discountPercentage: number;
  isActive: boolean;
  description: string;
  storeId: string;
  productIds: string[];
}
