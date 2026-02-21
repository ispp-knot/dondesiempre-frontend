import { LngLat } from '@vis.gl/react-maplibre';

export type Store = {
  name: string;
  location: LngLat;
  color: string;
  address: string;
  rating: number;
  imageUrl: string;
};
