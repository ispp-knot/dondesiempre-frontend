import { getBackendUrl } from '@/lib/config';
import { StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function searchStores(name?: string, lat?: number, lon?: number): Promise<StoreDTO[]> {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/v1/stores`;

  try {
    return (await authorizedOfetch(url, {
      method: 'GET',
      query: {
        ...(name && { name }),
        ...(lat !== undefined && { lat }),
        ...(lon !== undefined && { lon }),
      },
    })) as StoreDTO[];
  } catch (_error) {
    console.error('Error searching stores:', _error);
    return [];
  }
}
