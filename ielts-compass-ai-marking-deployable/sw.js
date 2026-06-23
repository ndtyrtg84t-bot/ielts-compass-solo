const CACHE_NAME = 'ielts-compass-bulk-bundle-v14';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './vocab-data.js',
  './user-vocab-modules.js',
  './user-vocab-data.js',
  './test-data.js',
  './manifest.json',
  './pdf-assets/list11~16.pdf',
  './pdf-assets/list17~27.pdf',
  './pdf-assets/list1~10.pdf',
  './pdf-assets/list28~37.pdf',
  './pdf-assets/list38~47.pdf',
  './pdf-assets/list48~56.pdf',
  './pdf-assets/list57~63.pdf',
  './pdf-assets/中译英.pdf',
  './pdf-assets/英译中.pdf',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
