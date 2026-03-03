import { NIL as NIL_UUID } from 'uuid';

export type isFollowingResponse = {
  clientId: typeof NIL_UUID;
  storeId: typeof NIL_UUID;
  isFollowing: boolean;
};
