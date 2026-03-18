import { NIL as NIL_UUID } from 'uuid';

export interface StoreFollowerDTO {
  clientId: typeof NIL_UUID;
  storeId: typeof NIL_UUID;
  isFollowing: boolean;
}
