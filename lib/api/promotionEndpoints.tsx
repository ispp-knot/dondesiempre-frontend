import { getBackendUrl } from '@/lib/config';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

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

export async function createPromotion(dto: PromotionCreationDTO): Promise<PromotionDTO> {
  const response = await authorizedOfetch(
    `${getBackendUrl()}/api/v1/promotions`,
    {
      method: 'POST',
      body: dto,
    }
  );
  return response;
}
export async function getPromotionById(id: string): Promise<PromotionDTO> {
  const response = await authorizedOfetch(
    `${getBackendUrl()}/api/v1/promotions/${id}`,
    {
      method: 'GET',
    }
  );
  return response;
}

export async function updatePromotionDiscount(id: string, discount: number): Promise<PromotionDTO> {
  const response = await authorizedOfetch(
    `${getBackendUrl()}/api/v1/promotions/${id}/discount?discountPercentage=${discount}`,
    {
      method: 'PATCH',
    }
  );
  return response;
}
