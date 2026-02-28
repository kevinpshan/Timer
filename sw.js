const CACHE_NAME = ‘SDTM-TIMER-V3.2.3’; // Update this whenever you change index.html

const ASSETS = [
‘index.html’,
‘manual.html’,
‘manifest.json’
];

// 1. Install Phase: Download new files and force immediate take-over
self.addEventListener(‘install’, (event) => {
self.skipWaiting(); // Forces the new service worker to become active immediately
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
console.log(‘Caching assets’);
return cache.addAll(ASSETS);
})
);
});

// 2. Activate Phase: Delete any old caches to free up space and prevent conflicts
self.addEventListener(‘activate’, (event) => {
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cache) => {
if (cache !== CACHE_NAME) {
console.log(‘Deleting old cache:’, cache);
return caches.delete(cache);
}
})
);
}).then(() => self.clients.claim()) // Forces open pages to use this new worker immediately
);
});

// 3. Fetch Phase: Network-first strategy (Try internet first, then use cache if offline)
self.addEventListener(‘fetch’, (event) => {
event.respondWith(
fetch(event.request).catch(() => {
return caches.match(event.request);
})
);
});