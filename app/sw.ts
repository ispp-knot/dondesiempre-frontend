import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkFirst, Serwist } from 'serwist';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import { ConfigShape } from '@/lib/config';

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

let webUrl = '';
let backendUrl = '';
let notificationVapidPublic = '';
let authToken = '';

async function storeConfig(config: Partial<ConfigShape>, options?: { saveToCache?: boolean }) {
  backendUrl = config.backendUrl ?? '';
  webUrl = config.webUrl ?? '';
  notificationVapidPublic = config.notificationVapidPublic ?? '';
  authToken = config.authToken ?? '';

  if (options?.saveToCache) {
    const cache = await caches.open('sw-config');
    const config: ConfigShape = {
      backendUrl,
      webUrl,
      notificationVapidPublic,
      authToken,
    };
    await cache.put('config', new Response(JSON.stringify(config)));
  }

  setUpNotifications();
}

// Configuration
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    caches.open('sw-config').then(async (cache) => {
      const res = await cache.match('config');
      if (!res) return;

      const config = (await res.json()) as Partial<ConfigShape>;

      storeConfig(config);
    })
  );
});

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SET_CONFIG') {
    const config = event.data as Partial<ConfigShape>;

    storeConfig(config, { saveToCache: true });
  } else if (event.data?.type === 'SETUP_NOTIFS') {
    setUpNotifications();
  }
});

// Notifications
function toBase64url(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function subscribe(subscription: PushSubscription) {
  const notificationEndPoint = subscription.endpoint;
  const publicKey = toBase64url(subscription.getKey('p256dh'));
  const auth = toBase64url(subscription.getKey('auth'));

  await authorizedOfetch(
    backendUrl + '/api/v1/notifications/subscribe',
    {
      method: 'POST',
      body: {
        notificationEndPoint,
        publicKey,
        auth,
      },
    },
    authToken || undefined
  );
}

async function unsubscribe(subscription: PushSubscription) {
  await authorizedOfetch(
    backendUrl + '/api/v1/notifications/unsubscribe',
    {
      method: 'POST',
      body: {
        notificationEndPoint: subscription.endpoint,
      },
    },
    authToken || undefined
  );

  await subscription.unsubscribe();
}

async function setUpNotifications() {
  if (!notificationVapidPublic) return;
  if (Notification.permission !== 'granted') return;

  const registration = self.registration;
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(notificationVapidPublic),
    }));

  await subscribe(subscription);

  console.log('Push subscription:', subscription.toJSON());

  await authorizedOfetch(
    backendUrl + '/api/v1/notifications/confirmationNotification',
    { method: 'POST' },
    authToken || undefined
  );
}

self.addEventListener('pushsubscriptionchange', async (event) => {
  const { oldSubscription, newSubscription } = event;

  if (oldSubscription) await self.registration.pushManager.subscribe(oldSubscription.options);

  if (newSubscription) await subscribe(newSubscription);
  if (oldSubscription) await unsubscribe(oldSubscription);
});

self.addEventListener('push', function (event) {
  if (!(Notification.permission === 'granted')) {
    return;
  }

  let data: { title?: string; message?: string; clickTarget?: string } = {};
  if (event.data) {
    data = event.data.json();
  }
  const { title, message, clickTarget } = data;
  const icon = '/icons/icon-512x512.png';

  if (!title) return;
  if (!clickTarget) return;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      navigate: clickTarget,
      icon: icon,
      badge: icon,
    } as NotificationOptions)
  );
});

const urlBase64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

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
