const IMAGE_CACHE = 'portfolio-image-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('portfolio-image-cache-') && key !== IMAGE_CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.destination !== 'image') return;

  event.respondWith((async () => {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        try {
          await cache.put(request, response.clone());
        } catch {
          // Some cross-origin responses or storage policies may prevent caching.
        }
      }
      return response;
    } catch (error) {
      const fallback = await cache.match(request);
      if (fallback) return fallback;
      throw error;
    }
  })());
});
