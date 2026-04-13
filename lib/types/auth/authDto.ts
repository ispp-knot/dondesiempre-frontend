import { StoreDTO } from '@/lib/types/stores/storesDto';
import { ClientDTO } from '@/lib/types/clients/clientsDto';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterStoreDTO {
  email: string;
  password: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours: string;
  phone: string | null;
  aboutUs: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface RegisterClientDTO {
  email: string;
  password: string;
  name: string;
  surname: string;
}

/**
 * The full user context stored in the AuthContext and in localStorage under the
 * key "auth_user". Populated from a LoginResponseDTO after login.
 */
export interface UserResponseDTO {
  id: string;
  email: string;
  /** e.g. ["STORE"] or ["CLIENT"] — always a single-element list today */
  roles: string[];
  /** ISO-8601 UTC timestamp string for the JWT expiry */
  expiresAt: string;
  store: StoreDTO | null;
  client: ClientDTO | null;
}

/** Shape returned by POST /api/v1/auth/login */
export interface LoginResponseDTO {
  user: UserResponseDTO;
  token: string;
}
