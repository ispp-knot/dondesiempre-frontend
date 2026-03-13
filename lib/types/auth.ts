export interface StorefrontInfo {
  id: string;
  isFirstCollections: boolean | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  bannerImageUrl: string | null;
}

export interface StoreInfo {
  id: string;
  name: string;
  email: string;
  storeID: string;
  address: string;
  openingHours: string;
  phone: string | null;
  aboutUs: string | null;
  acceptsShipping: boolean;
  latitude: number | null;
  longitude: number | null;
  storefront: StorefrontInfo | null;
  socialNetworks: unknown[] | null;
}

export interface ClientInfo {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  address: string | null;
}

/**
 * The full user context returned by /login and /me, stored in the AuthContext
 * and in localStorage under the key "auth_user".
 */
export interface UserInfo {
  id: string;
  email: string;
  /** e.g. ["STORE"] or ["CLIENT"] — always a single-element list today */
  roles: string[];
  /** ISO-8601 UTC timestamp string for the JWT expiry */
  expiresAt: string;
  store: StoreInfo | null;
  client: ClientInfo | null;
}

/**
 * The minimal payload stored in the non-HttpOnly "session" cookie, base64-encoded
 * as JSON. Used by the Next.js middleware for server-side route guards.
 * This is intentionally unsigned and not verified — used only for routing decisions.
 */
export interface SessionCookiePayload {
  id: string;
  email: string;
  roles: string[];
  expiresAt: string;
}

export interface RegisterClientDTO {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: string | null;
  address: string | null;
}

export interface RegisterStoreDTO {
  email: string;
  password: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours: string;
  acceptsShipping: boolean;
  phone: string | null;
  aboutUs: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
