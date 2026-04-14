import { ConfigShape } from '@/lib/config';

// export const dynamic = 'force-dynamic';

const config: Omit<ConfigShape, 'authToken'> = {
  backendUrl: process.env.BACKEND_URL ?? '',
  webUrl: process.env.WEB_URL ?? '',
  notificationVapidPublic: process.env.NOTIFICATION_VAPID_PUBLIC ?? '',
};

const configJs = `window.__CONFIG__ = ${JSON.stringify(config)};`;

export function GET() {
  return new Response(configJs, {
    headers: { 'Content-Type': 'application/javascript' },
  });
}
