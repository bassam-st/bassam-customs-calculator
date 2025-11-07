// sw.js (محسّن)
const CACHE_STATIC = "bassam-static-v2";
const CACHE_DYNAMIC = "bassam-dynamic-v2";

const STATIC_ASSETS = [
  "/", "/index.html", "/prices.html", "/hs.html",
  "/manifest.json",
  "/icons/icon-192.png", "/icons/icon-512.png",
  "/assets/prices_catalog.json", // سيُدار كشبكي لاحقاً أيضاً
  "/assets/hs_catalog.json"      // نفس الشيء
];

// تثبيت: تخزين الأصول الثابتة
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // فعّل الـSW الجديد فوراً
});

// تفعيل: تنظيف الكاشات القديمة
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_STATIC, CACHE_DYNAMIC].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // سيطر على كل الصفحات المفتوحة
});

// استراتيجية جلب:
// - JSON (catalogs): Network-first لتحديث سريع، مع fallback للكاش.
// - بقية الطلبات: Cache-first لسرعة التحميل.
// - تنقّل صفحات (mode: navigate): أعد index.html عند عدم توفر الشبكة.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // تنقّل صفحات كـ SPA fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // ملفات JSON (الكتالوجات) => Network-first
  const isCatalogJson =
    isSameOrigin &&
    (url.pathname.endsWith("/assets/prices_catalog.json") ||
     url.pathname.endsWith("/assets/hs_catalog.json"));

  if (isCatalogJson) {
    event.respondWith(networkFirst(req));
    return;
  }

  // باقي الأصول من نفس الأصل => Cache-first
  if (isSameOrigin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // طلبات خارجية: جرّب الشبكة ثم الكاش
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_STATIC);
  const cached = await cache.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  // لا تضع opaque responses في الكاش بلا داعٍ
  if (fresh && fresh.ok) cache.put(req, fresh.clone());
  return fresh;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_DYNAMIC);
  try {
    const fresh = await fetch(req, { cache: "no-store" });
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req) || (await caches.match(req));
    if (cached) return cached;
    // آخر حل: 404 بسيطة
    return new Response("Offline and no cached data available.", { status: 503 });
  }
}
