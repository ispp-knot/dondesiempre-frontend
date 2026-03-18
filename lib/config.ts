import _ from "lodash";

let _backendUrl: string | undefined;
let _webUrl: string | undefined;
let _directoryBackend: string | undefined;

export function initClientConfig(backendUrl: string, webUrl: string, directoryBackend: string) {
  _backendUrl = backendUrl;
  _webUrl = webUrl;
  _directoryBackend = directoryBackend;
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

export function getDirectoryBackend(): string {
  if (typeof window === 'undefined') {
    return process.env.DIR_BACKEND ?? '';
  }
  return _directoryBackend ?? '';
}

