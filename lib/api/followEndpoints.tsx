import { getBackendUrl } from '@/lib/config';
import { isFollowingResponse } from '../types/shop';
import { StoreDTO } from '../api/types';
import { authorizedOfetch } from './authorizedOfetch';

export async function getFollowedStores(): Promise<StoreDTO[]> {
  return await authorizedOfetch(
    getBackendUrl() + '/api/v1/clients/me/followed-stores'
  );
}

export async function followStore(storeId: string | number): Promise<void> {
  await authorizedOfetch(
    getBackendUrl() + `/api/v1/stores/${storeId}/followers`,
    { method: 'POST' }
  );
}

export async function unfollowStore(storeId: string | number): Promise<void> {
  await authorizedOfetch(
    getBackendUrl() + `/api/v1/stores/${storeId}/followers/me`,
    { method: 'DELETE' }
  );
}

export async function isFollowingStore(storeId: string | number): Promise<isFollowingResponse> {
  return await authorizedOfetch(
    getBackendUrl() + `/api/v1/stores/${storeId}/followers/me`
  );
}
