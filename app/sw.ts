import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkFirst, Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

let backendUrl = '';

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open('sw-config').then(async (cache) => {
      const res = await cache.match('config');
      if (res) backendUrl = (await res.json()).backendUrl ?? '';
    })
  );
});

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SET_CONFIG') {
    backendUrl = event.data.backendUrl;
    const cache = await caches.open('sw-config');
    await cache.put('config', new Response(JSON.stringify({ backendUrl })));
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    // Whether outdated caches should be removed.
    cleanupOutdatedCaches: true,
    concurrency: 10,
    ignoreURLParametersMatching: [],
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher({ request }) {
        // Cache everything except backend API calls
        // backendUrl isn't available from the start, because it's received at runtime from the Next server
        // Therefore it's possible this runs with backendUrl = ""
        // In practice I've never seen it happen but I'm sure the debugger makes it hard to catch

        // Scripts, CSS, etc. sets this to 'image', 'document', ...
        // fetch doesn't by default
        // Works surprisingly well, we could honestly make do with this and ditch the backendUrl thing
        // and it would mostly work.
        const isScriptFetch = request.destination !== '';

        // If backendUrl is unavailable, we just judge based on that. If it's set we also filter
        const includesBackendUrl = backendUrl && request.url.includes(backendUrl);
        const cache = !includesBackendUrl && isScriptFetch;
        return cache;
      },
      handler: new NetworkFirst({ cacheName: 'app' }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
