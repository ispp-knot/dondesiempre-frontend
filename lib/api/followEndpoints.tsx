import { Shop, isFollowingResponse } from '../types/shop';
import { authorizedOfetch } from './authorizedOfetch';

export async function getFollowedStores(): Promise<Shop[]> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/clients/me/followed-stores'
  );
}

export async function followStore(storeId: string | number): Promise<void> {
  await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/stores/${storeId}/followers`,
    { method: 'POST' }
  );
}

export async function unfollowStore(storeId: string | number): Promise<void> {
  await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/stores/${storeId}/followers/me`,
    { method: 'DELETE' }
  );
}

export async function isFollowingStore(storeId: string | number): Promise<isFollowingResponse> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/stores/${storeId}/followers/me`
  );
}
