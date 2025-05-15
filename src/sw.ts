/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Take control immediately
clientsClaim();
self.skipWaiting();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache the HTML files and handle SPA navigation
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache CSS, JS, and Web Worker files
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Handle offline fallback
const offlineFallbackPage = '/index.html';

// Handle SPA routing
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async () => {
    try {
      // Try to get the response from the network
      const cache = await caches.open('pages-cache');
      const response = await cache.match(offlineFallbackPage);
      return response || await fetch(offlineFallbackPage);
    } catch (error) {
      // If offline, return the cached index.html
      const cache = await caches.open('pages-cache');
      return cache.match(offlineFallbackPage);
    }
  }
);

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync localStorage data when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-localStorage') {
    event.waitUntil(syncLocalStorage());
  }
}); 