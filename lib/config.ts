declare global {
  interface Window {
    __CONFIG__?: { backendUrl: string; webUrl: string };
  }
}

export function notifyServiceWorker() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  const backendUrl = window.__CONFIG__?.backendUrl ?? '';
  const send = () =>
    navigator.serviceWorker.controller?.postMessage({ type: 'SET_CONFIG', backendUrl });
  send();
  navigator.serviceWorker.addEventListener('controllerchange', send, { once: true });
}

export function getBackendUrl(): string {
  if (typeof window === 'undefined') return process.env.BACKEND_URL ?? '';
  return window.__CONFIG__?.backendUrl ?? '';
}

export function getWebUrl(): string {
  if (typeof window === 'undefined') return process.env.WEB_URL ?? '';
  return window.__CONFIG__?.webUrl ?? '';
}
