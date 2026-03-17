import { cookies } from 'next/headers';
import type { SessionCookiePayload } from '@/lib/types/auth';

/**
 * Reads and decodes the non-HttpOnly "session" cookie set by the backend.
 * Returns null if the cookie is absent, malformed, or expired.
 *
 * This is intentionally unsigned and not verified — use only for routing
 * decisions (guards), never for security-critical logic.
 */
export async function getServerSession(): Promise<SessionCookiePayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('session')?.value;
  if (!raw) return null;

  try {
    const json = Buffer.from(raw, 'base64').toString('utf-8');
    const payload = JSON.parse(json) as SessionCookiePayload;

    if (!payload.id || !payload.email || !payload.roles || !payload.expiresAt) return null;
    if (new Date(payload.expiresAt) <= new Date()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns the session payload only if the user has the given role.
 */
export async function getServerSessionWithRole(role: string): Promise<SessionCookiePayload | null> {
  const session = await getServerSession();
  if (!session) return null;
  return session.roles.includes(role) ? session : null;
}
