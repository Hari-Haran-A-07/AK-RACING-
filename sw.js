/**
 * AK Racing - Offline Service Worker Cache
 * Caches core telemetry assets and vendor libraries for 100% offline trackside operation.
 */
const CACHE_NAME = 'ak-racing-v2.5.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/audio.js',
  './js/car3d.js',
  './js/speedometer.js',
  './manifest.json',
  './assets/official-hypercar.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn('Cache prefetch partial warning:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networked = fetch(e.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, cacheCopy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
