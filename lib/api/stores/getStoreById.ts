import { StoreDTO } from '../types';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';

export async function getStoreById(id: string): Promise<StoreDTO> {
  return (await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/stores/${id}`
  )) as StoreDTO;
}
