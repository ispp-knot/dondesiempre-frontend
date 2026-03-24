export const dynamic = 'force-dynamic';

const config = `window.__CONFIG__ = ${JSON.stringify({
  backendUrl: process.env.BACKEND_URL ?? '',
  webUrl: process.env.WEB_URL ?? '',
})};`;

export function GET() {
  return new Response(config, {
    headers: { 'Content-Type': 'application/javascript' },
  });
}
