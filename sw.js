const CACHE = "lunchwheel-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./og_icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
];

// install – 미리 캐시
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// activate – 이전 캐시 정리
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch – 캐시 우선, 실패 시 네트워크
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      res => res ||
        fetch(e.request).then(netRes => {
          // 동적으로 받은 것도 캐싱
          const clone = netRes.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return netRes;
        })
    )
  );
});
