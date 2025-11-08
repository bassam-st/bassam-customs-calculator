// sw.js — شبكة أولاً للصفحات فقط، ولا نتدخل في أصول /assets ولا json
const CACHE_NAME = 'bassam-v1';
const PRECACHE = [
  '/', '/index.html', '/prices.html', '/hs.html',
  '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  clients.claim();
});

// لا نتدخل مطلقًا في: js/json/svg/png/css و/أو أي شيء داخل /assets/
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (/\.(js|json|svg|png|ico|css|txt|map)$/.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    return; // اتركه للمتصفح (لن يُخزَّن في كاش SW)
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(url.pathname).then(r => r || caches.match('/index.html')))
    );
  }
});
