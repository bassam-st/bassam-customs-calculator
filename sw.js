// sw.js — GitHub Pages safe (relative-scope precache)
const CACHE_NAME = 'bassam-pwa-v3';

// نستخدم روابط نسبية ويتم تحويلها تلقائيًا لداخل scope الصحيح في GitHub Pages
const PRECACHE = [
  './',
  './index.html',
  './prices.html',
  './hs.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/prices_catalog.json',
  './assets/hs_catalog.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const base = self.registration.scope; // مثل: https://.../bassam-customs-calculator/
    const urls = PRECACHE.map(p => new URL(p, base).toString());
    await cache.addAll(urls);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Network-first للصفحات، وCache-first للأصول
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // فقط GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isAsset =
    url.pathname.includes('/assets/') ||
    /\.(js|json|svg|png|ico|css|txt|map|webmanifest)$/i.test(url.pathname);

  // صفحات التنقل (HTML)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE_NAME);
        // حاول نفس الصفحة أولاً
        const cached = await cache.match(req);
        if (cached) return cached;
        // ثم الصفحة الرئيسية
        return cache.match(new URL('./index.html', self.registration.scope).toString());
      }
    })());
    return;
  }

  // أصول: Cache-first ثم network
  if (isAsset) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return cached || Response.error();
      }
    })());
  }
});
