// Service worker: makes Grauer work offline.
// Bump VERSION whenever you change any file listed below so phones pick up the update.
const VERSION = 'grauer-v2';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/ui.js', 'js/tracks.js', 'js/db.js', 'js/content.js', 'js/audio.js', 'js/session.js', 'js/figure.js',
  'js/screens/onboarding.js', 'js/screens/home.js', 'js/screens/library.js',
  'js/screens/history.js', 'js/screens/settings.js', 'js/screens/player.js',
  'content/poses.json', 'content/exercises.json', 'content/sessions.json',
  'img/icon.svg', 'img/icon-192.png', 'img/icon-512.png', 'img/icon-maskable-512.png', 'img/apple-touch-icon.png',
  'img/placeholders/curl.svg', 'img/placeholders/think.svg',
  'img/avatars/juvenile.svg', 'img/avatars/blackback.svg', 'img/avatars/silverback.svg', 'img/avatars/grauer.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network first (so updates show up when online), falling back to the cache offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
