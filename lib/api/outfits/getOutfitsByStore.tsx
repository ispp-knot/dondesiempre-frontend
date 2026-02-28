import { OutfitDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getOutfitByStoreId(id: string): Promise<OutfitDTO[]> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stores/${id}/outfits`;

  try {
    const response = (await authorizedOfetch(url, {
      method: 'GET',
    })) as OutfitDTO[];

    return response;
  } catch (error) {
    console.error('Error fetching outfits: ' + error);
    throw error;
  }
}

export async function getOutfitById(id: string): Promise<OutfitDTO> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/outfits/${id}`;

  try {
    const response = (await authorizedOfetch(url, {
      method: 'GET',
    })) as OutfitDTO;

    return response;
  } catch (error) {
    console.error('Error fetching outfit  with id ' + id + ': ' + error);
    throw error;
  }
}
