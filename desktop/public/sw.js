const CACHE_NAME = 'sidepak-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch handler to satisfy PWA criteria.
  // We can add aggressive offline caching here later if needed.
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('SIDEPAK Offline. Please check your internet connection.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }));
});
