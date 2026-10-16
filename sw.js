// Keeps the Phone Check-in page working with no signal: the page and its
// icons are saved on the phone the first time it opens. Change VERSION
// whenever a file here changes so phones pick up the new copy.
const VERSION = 'checkin-v4';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first (so an update shows up when there's signal), saved copy otherwise.
// no-cache: ask GitHub for the newest copy instead of one the phone kept for a
// few minutes, so a new upload shows up the next time the page opens.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request.url, {cache: 'no-cache'})
    .then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    })
    .catch(() => caches.match(e.request, {ignoreSearch: true})));
});
