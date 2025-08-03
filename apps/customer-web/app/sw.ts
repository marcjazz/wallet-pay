import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

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

const serwist = new Serwist({
  precacheEntries: [
    ...(self.__SW_MANIFEST || []),
    {
      url: '/',
      revision: null
    },
    {
      url: '/app',
      revision: null
    },
    {
      url: '/assets/logo.png',
      revision: null
    },
    {
      url: '/assets/logo.svg',
      revision: null
    },
    {
      url: '/assets/pwa_logo.png',
      revision: null
    },
    {
      url: '/assets/pwa_logo.svg',
      revision: null
    },
    {
      url: '/assets/welcome_screen_img.png',
      revision: null
    }
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache
});

/**
 * Event listener for push notifications.
 * @param {PushEvent} event - The push event.
 */
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/assets/logo.png',
      badge: '/assets/logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

/**
 * Event listener for notification clicks.
 * @param {NotificationEvent} event - The notification click event.
 */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // This opens the app to the home page.
  event.waitUntil(self.clients.openWindow('/'));
});

serwist.addEventListeners();
