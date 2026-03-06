import { getBackendUrl } from '@/lib/config';
import { StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getStoreById(id: string): Promise<StoreDTO> {
  return (await authorizedOfetch(getBackendUrl() + `/api/v1/stores/${id}`)) as StoreDTO;
}
