import { getBackendUrl } from '@/lib/config';
import { StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getStore(id: string): Promise<StoreDTO> {
  const url = `${getBackendUrl()}/api/v1/stores/${id}`;

  try {
    const response = (await authorizedOfetch(url, {
      method: 'GET',
    })) as StoreDTO;

    return response;
  } catch (error) {
    console.error('Error fetching store: ' + error);
    throw error;
  }
}
