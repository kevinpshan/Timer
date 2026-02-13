const CACHE_NAME = 'SDTM-TIMER-V2.1.2'; // Change this to update the version
const ASSETS = [
  'index.html',
  'manual.html',
  'manifest.json'
];

// 1. Install Phase - Download new files
self.addEventListener('install', (event) => {
  self.skipWaiting(); // FORCE new SW to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Phase - Remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Forces current tabs to use the new SW
  );
});

// 3. Fetch Phase - Serve from cache, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
