// sw.js — نسخة آمنة لا تتدخل في الأصول (بدون skipWaiting لتجنب التحديث المفاجئ)
const CACHE_NAME = 'bassam-v1';
const PRECACHE = [
  '/', '/index.html', '/prices.html', '/hs.html',
  '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  // تمت إزالة self.skipWaiting(); كي لا يحدث "رفرش" مفاجئ
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  clients.claim();
});

// Network-first للصفحات فقط — لا نتدخل في الأصول (js/json/png/…)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // لا تتدخل في ملفات الأصول إطلاقًا
  if (/\.(js|json|svg|png|ico|css|txt|map)$/.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    return; // دع المتصفح يتصرف
  }

  // لطلبات التنقل فقط
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(url.pathname).then(r => r || caches.match('/index.html')))
    );
  }
});
