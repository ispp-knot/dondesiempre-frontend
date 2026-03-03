import { StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getStore(id: string): Promise<StoreDTO> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stores/${id}`;

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
