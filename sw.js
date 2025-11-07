// sw.js
const CACHE_NAME='bassam-v1';
const PRECACHE=['/','/index.html','/prices.html','/hs.html','/manifest.json','/icons/icon-192.png','/icons/icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(PRECACHE))); self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // لا تتدخل في الأصول
  if (/\.(js|json|svg|png|ico|css|txt|map)$/.test(url.pathname) || url.pathname.startsWith('/assets/')) return;
  // للصفحات فقط
  if (e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match(url.pathname).then(r=>r||caches.match('/index.html'))));
  }
});
