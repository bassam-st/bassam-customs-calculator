// sw.js
const CACHE_NAME = "bassam-customs-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/prices.html",
  "/hs.html",
  "/manifest.json",
  "/assets/hs_catalog.json",
  "/assets/prices_catalog.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// عند التثبيت: تخزين الملفات
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// عند طلب ملف: جلبه من الكاش أو من الشبكة
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// عند التحديث: حذف الكاش القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});
