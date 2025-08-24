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
  precacheEntries: self.__SW_MANIFEST || [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
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

self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  const { title, body } = event.data?.json() || {
    title: 'Push Notification',
    body: 'You have a new notification.',
  };
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
    })
  );
});

serwist.addEventListeners();
