export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const fs = await import('fs');
    const config = `window.__CONFIG__ = ${JSON.stringify({
      backendUrl: process.env.BACKEND_URL ?? '',
      webUrl: process.env.WEB_URL ?? '',
    })};`;
    fs.writeFileSync('./public/config.js', config);
  }
}
