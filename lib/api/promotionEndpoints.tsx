import { getBackendUrl } from '@/lib/config';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import { ProductDTO } from './types';

export interface PromotionCreationDTO {
  name: string;
  discountPercentage: number;
  active: boolean;
  productIds: string[];
  storeId: string;
  description?: string;
}

export interface PromotionDTO {
  id: string;
  name: string;
  discountPercentage: number;
  active: boolean;
  description: string;
  storeId: string;
  startDate: string;
  endDate: string;
  products: ProductDTO[];
  promotionImageUrl?: string;
}

export async function createPromotion(dto: PromotionCreationDTO): Promise<PromotionDTO> {
  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
  formData.append('dto', jsonBlob);

  const response = await authorizedOfetch(`${getBackendUrl()}/api/v1/promotions`, {
    method: 'POST',
    body: formData,
  });
  return response;
}

export async function getPromotionById(id: string): Promise<PromotionDTO> {
  const response = await authorizedOfetch(`${getBackendUrl()}/api/v1/promotions/${id}`, {
    method: 'GET',
  });
  return response;
}

export async function updatePromotion(
  id: string,
  dto: Partial<PromotionCreationDTO>
): Promise<PromotionDTO> {
  const response = await authorizedOfetch(`${getBackendUrl()}/api/v1/promotions/${id}`, {
    method: 'PUT',
    body: dto,
  });
  return response;
}

export async function getPromotionsByStoreId(storeId: string): Promise<PromotionDTO[]> {
  const response = await authorizedOfetch(
    `${getBackendUrl()}/api/v1/stores/${storeId}/promotions`,
    {
      method: 'GET',
    }
  );
  return response;
}
