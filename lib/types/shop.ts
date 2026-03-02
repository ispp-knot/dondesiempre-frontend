export type Shop = {
  id: string | number;
  name: string;
  email: string;
  storeID: string | number;
  openingHours: string;
  phone: string;
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
  address: string;
};

export type isFollowingResponse = {
  clientId: string;
  storeId: string | number;
  isFollowing: boolean;
};
