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
