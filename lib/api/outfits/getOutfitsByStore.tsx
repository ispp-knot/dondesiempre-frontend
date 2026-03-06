import { getBackendUrl } from '@/lib/config';
import { Outfit } from '@/lib/types/outfits';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getOutfitByStoreId(id: string): Promise<Outfit[]> {
  const url = `${getBackendUrl()}/api/v1/stores/${id}/outfits`;

  try {
    const response = (await authorizedOfetch(url, {
      method: 'GET',
    })) as Outfit[];

    return response;
  } catch (error) {
    console.error('Error fetching outfits: ' + error);
    throw error;
  }
}

export async function getOutfitById(id: string): Promise<Outfit> {
  const url = `${getBackendUrl()}/api/v1/outfits/${id}`;

  try {
    const response = (await authorizedOfetch(url, {
      method: 'GET',
    })) as Outfit;

    return response;
  } catch (error) {
    console.error('Error fetching outfit  with id ' + id + ': ' + error);
    throw error;
  }
}
