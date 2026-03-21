let _backendUrl: string | undefined;
let _webUrl: string | undefined;

export function initClientConfig(backendUrl: string, webUrl: string) {
  _backendUrl = backendUrl;

  _webUrl = webUrl;

  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    const send = () =>
      navigator.serviceWorker.controller?.postMessage({ type: 'SET_CONFIG', backendUrl });
    send();
    navigator.serviceWorker.addEventListener('controllerchange', send, { once: true });
  }
}

export function getBackendUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL ?? '';
  }
  return _backendUrl ?? '';
}

export function getWebUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.WEB_URL ?? '';
  }
  return _webUrl ?? '';
}
